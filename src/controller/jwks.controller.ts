import { Request, Response } from 'express';
import jose from 'node-jose';
import { PUBLIC_KEY } from '../utils/cert';

export const jwks = async (req: Request, res: Response) => {
  try {
    const keystore = jose.JWK.createKeyStore();
    
    const key = await keystore.add(PUBLIC_KEY, 'pem', {
      use: 'sig',
      alg: 'RS256',
    });

    res.json(keystore.toJSON());
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};