import { Request,Response } from 'express';
import {env} from '../config/env'


export const discovery =  (req: Request, res: Response) => {
     return  res.json({
    issuer: env.issuerUrl,
    authorization_endpoint: `${env.issuerUrl}/authorize`,
    token_endpoint: `${env.issuerUrl}/token`,
    userinfo_endpoint: `${env.issuerUrl}/userinfo`,
    jwks_uri: `${env.issuerUrl}/.well-known/jwks.json`,
    scopes_supported: ["openid", "profile", "email"],
    response_types_supported: ["code"],
    grant_types_supported: ["authorization_code"],
    subject_types_supported: ["public"],
    id_token_signing_alg_values_supported: ["RS256"],
    code_challenge_methods_supported: ["S256"],
  });
}