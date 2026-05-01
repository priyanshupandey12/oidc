import { Request, Response } from 'express';
import * as tokenService from '../services/token.service';

export const token = async (req: Request, res: Response) => {
  try {
    const { grant_type, code, redirect_uri, client_id, client_secret, refresh_token } = req.body;

    const response = await tokenService.exchangeToken({
      grantType: grant_type,
      code,
      redirectUri: redirect_uri,
      clientId: client_id,
      clientSecret: client_secret,
      refreshToken: refresh_token,
    });

    res.json(response);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};