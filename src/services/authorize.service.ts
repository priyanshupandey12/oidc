import { AuthorizeParams } from '../types/authorize.types';
import { authorizationCodes, clients } from '../db/schema';
import { db } from '../db/index'
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

export const validateAuthorizeRequest = async (params: Omit<AuthorizeParams, 'userId'>) => {
  const isClientValid = await db.select().from(clients).where(
    eq(clients.id, params.clientId)
  );

  if(isClientValid.length === 0) {
    throw new Error("Invalid client_id");
  }

  const client = isClientValid[0];

  if(!client.isActive) {
    throw new Error("Client is inactive");
  }

  if(!client.redirectUris.includes(params.redirectUri.trim())) {
    throw new Error("Invalid redirect_uri");
  }
 
  if(!params.scopes.every(scope => client.allowedScopes.includes(scope))) {
    throw new Error("Invalid scopes");
  }

  if(params.responseType !== "code"){
    throw new Error("Unsupported response_type");
  }

  return { client };
};

export const generateCode = async (params: AuthorizeParams) => {
  const generatedCode = crypto.randomBytes(32).toString('hex');
  const codeExpiry = new Date(Date.now() + 10 * 60 * 1000); 

  await db.insert(authorizationCodes).values({
    code: generatedCode,
    userId: params.userId,
    clientId: params.clientId,
    redirectUri: params.redirectUri,
    scopes: params.scopes,
    expiresAt: codeExpiry,
  });

  return {
    redirect: `${params.redirectUri}?code=${generatedCode}&state=${params.state}`
  };
};
