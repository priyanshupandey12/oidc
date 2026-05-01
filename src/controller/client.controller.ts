import { Request, Response } from 'express';
import { registerClient } from '../services/client.service';

export const RegisterClient = async (req: Request, res: Response) => {
  try {
    const { name, redirectUris, allowedScopes } = req.body;

    if (!name || !redirectUris || !allowedScopes) {
      res.status(400).json({ error: 'name, redirectUris, allowedScopes required' });
      return;
    }

    const response = await registerClient(name, redirectUris, allowedScopes);

    res.status(201).json({
      message: 'Client registered successfully. Save your clientSecret — it will not be shown again!',
      ...response,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};