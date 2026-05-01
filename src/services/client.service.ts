import { db } from '../db/index';
import { clients } from '../db/schema';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

export const registerClient = async (name: string, redirectUris: string[], allowedScopes: string[]) => {

  const plainSecret = crypto.randomBytes(32).toString('hex');
  

  const hashedSecret = await bcrypt.hash(plainSecret, 10);


  const result = await db.insert(clients).values({
    name,
    secret: hashedSecret,
    redirectUris,
    allowedScopes,
    isActive: true,
  }).returning();


  return {
    clientId: result[0].id,
    clientSecret: plainSecret, 
    name: result[0].name,
    redirectUris: result[0].redirectUris,
    allowedScopes: result[0].allowedScopes,
  };
};