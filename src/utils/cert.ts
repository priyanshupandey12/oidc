import { readFileSync } from "node:fs";
import path from "node:path";
import 'dotenv/config';

function getPrivateKey(): Buffer {
  if (process.env.PRIVATE_KEY) {
    return Buffer.from(process.env.PRIVATE_KEY.replace(/\\n/g, '\n'), 'utf-8');
  }
  return readFileSync(path.resolve("cert/private-key.pem"));
}

function getPublicKey(): Buffer {
  if (process.env.PUBLIC_KEY) {
    return Buffer.from(process.env.PUBLIC_KEY.replace(/\\n/g, '\n'), 'utf-8');
  }
  return readFileSync(path.resolve("cert/public-key.pub"));
}

export const PRIVATE_KEY = getPrivateKey();
export const PUBLIC_KEY = getPublicKey();