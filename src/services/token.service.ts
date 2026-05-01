import { db } from '../db/index';
import { authorizationCodes, clients, users, refreshTokens } from '../db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { ExchangeTokenParams } from '../types/token.types';
import { PRIVATE_KEY } from '../utils/cert';
import crypto from 'crypto';


const handleAuthorizationCode = async (params: ExchangeTokenParams) => {

  const codes = await db.select()
    .from(authorizationCodes)
    .where(eq(authorizationCodes.code, params.code));

  if (codes.length === 0) {
    throw new Error('Invalid code');
  }

  const authCode = codes[0];


  if (new Date() > authCode.expiresAt) {
    throw new Error('Code expired');
  }


  if (authCode.usedAt) {
    throw new Error('Code already used');
  }

  if (authCode.clientId !== params.clientId) {
    throw new Error('Invalid client_id');
  }

  if (authCode.redirectUri.trim() !== params.redirectUri.trim()) {
    throw new Error('Invalid redirect_uri');
  }


  const clientResult = await db.select()
    .from(clients)
    .where(eq(clients.id, params.clientId));

  if (clientResult.length === 0) {
    throw new Error('Invalid client');
  }

  const client = clientResult[0];

  const isSecretValid = await bcrypt.compare(params.clientSecret, client.secret);
  if (!isSecretValid) {
    throw new Error('Invalid client_secret');
  }


  const userResult = await db.select()
    .from(users)
    .where(eq(users.id, authCode.userId));

  if (userResult.length === 0) {
    throw new Error('User not found');
  }

  const user = userResult[0];


  await db.update(authorizationCodes)
    .set({ usedAt: new Date() })
    .where(eq(authorizationCodes.code, params.code));


  const accessToken = jwt.sign(
    {
      sub: user.id,
      iss: env.issuerUrl,
      aud: params.clientId,
      scope: authCode.scopes.join(' '),
    },
    PRIVATE_KEY,
    { algorithm: 'RS256', expiresIn: '15m' }
  );

  const idToken = jwt.sign(
    {
      sub: user.id,
      iss: env.issuerUrl,
      aud: params.clientId,
      email: user.email,
      name: user.name,
    },
    PRIVATE_KEY,
    { algorithm: 'RS256', expiresIn: '15m' }
  );

  const refreshToken = crypto.randomBytes(64).toString('hex');

  await db.insert(refreshTokens).values({
    token: refreshToken,
    userId: user.id,
    clientId: params.clientId,
    scopes: authCode.scopes,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });

  return {
    access_token: accessToken,
    refresh_token: refreshToken,
    id_token: idToken,
    token_type: 'Bearer',
    expires_in: 900,
  };
};


const handleRefreshToken = async (params: ExchangeTokenParams) => {

  const tokenResult = await db.select()
    .from(refreshTokens)
    .where(eq(refreshTokens.token, params.refreshToken!));

  if (tokenResult.length === 0) {
    throw new Error('Invalid refresh_token');
  }

  const refreshToken = tokenResult[0];


  if (refreshToken.revokedAt) {
    throw new Error('Refresh token has been revoked');
  }


  if (new Date() > refreshToken.expiresAt) {
    throw new Error('Refresh token expired');
  }


  if (refreshToken.usedAt) {
    await db.update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(eq(refreshTokens.clientId, params.clientId));
    throw new Error('Refresh token already used - possible theft detected');
  }


  if (refreshToken.clientId !== params.clientId) {
    throw new Error('Invalid client_id');
  }


  const clientResult = await db.select()
    .from(clients)
    .where(eq(clients.id, params.clientId));

  if (clientResult.length === 0) {
    throw new Error('Invalid client');
  }

  const isSecretValid = await bcrypt.compare(params.clientSecret, clientResult[0].secret);
  if (!isSecretValid) {
    throw new Error('Invalid client_secret');
  }


  const userResult = await db.select()
    .from(users)
    .where(eq(users.id, refreshToken.userId));

  if (userResult.length === 0) {
    throw new Error('User not found');
  }

  const user = userResult[0];


  await db.update(refreshTokens)
    .set({ usedAt: new Date() })
    .where(eq(refreshTokens.token, params.refreshToken!));


  const newRefreshToken = crypto.randomBytes(64).toString('hex');
  await db.insert(refreshTokens).values({
    token: newRefreshToken,
    userId: user.id,
    clientId: params.clientId,
    scopes: refreshToken.scopes,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });


  const accessToken = jwt.sign(
    {
      sub: user.id,
      iss: env.issuerUrl,
      aud: params.clientId,
      scope: refreshToken.scopes.join(' '),
    },
    PRIVATE_KEY,
    { algorithm: 'RS256', expiresIn: '15m' }
  );

  return {
    access_token: accessToken,
    refresh_token: newRefreshToken,
    token_type: 'Bearer',
    expires_in: 900,
  };
};


export const exchangeToken = async (params: ExchangeTokenParams) => {
  if (params.grantType === 'authorization_code') {
    return await handleAuthorizationCode(params);
  } else if (params.grantType === 'refresh_token') {
    return await handleRefreshToken(params);
  } else {
    throw new Error('Unsupported grant_type');
  }
};