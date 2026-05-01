import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { PUBLIC_KEY } from '../utils/cert';
import { db } from '../db/index';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

export const userinfo = async (req: Request, res: Response) => {
  try {
   
    const authHeader = req.headers.authorization;
  
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Missing or invalid authorization header' });
      return;
    }

    const token = authHeader.split(' ')[1];


    const payload = jwt.verify(token, PUBLIC_KEY, { algorithms: ['RS256'] }) as any;


    const userResult = await db.select()
      .from(users)
      .where(eq(users.id, payload.sub));

    if (userResult.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const user = userResult[0];


    const { passwordHash, ...safeUser } = user;

    res.json(safeUser);
  } catch (error: any) {
    res.status(401).json({ error: 'Invalid token' });
  }
};