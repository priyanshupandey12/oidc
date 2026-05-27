import { Request,Response } from 'express';
import * as authorizeService from '../services/authorize.service';


export const authorize =  async (req: Request, res: Response) => {

  const { response_type, client_id, redirect_uri, scope, state} = req.query;

  const originalUrl = req.originalUrl; 

  if (!req.session.userId) {
    res.redirect(`/login.html?returnTo=${encodeURIComponent(originalUrl)}`);
    return;
  }
  
  try {
    const responseTypeStr = (response_type as string)?.trim();
    const clientIdStr = client_id as string;
    const redirectUriStr = redirect_uri as string;
    const scopesArr = (scope as string)?.split(" ").filter(s => s.trim() !== "");
    const stateStr = state as string;

    const { client } = await authorizeService.validateAuthorizeRequest({
      responseType: responseTypeStr,
      clientId: clientIdStr,
      redirectUri: redirectUriStr,
      scopes: scopesArr,
      state: stateStr
    });

    const consentUrl = `/consent.html?client_id=${encodeURIComponent(clientIdStr)}&client_name=${encodeURIComponent(client.name)}&redirect_uri=${encodeURIComponent(redirectUriStr)}&scope=${encodeURIComponent(scope as string)}&state=${encodeURIComponent(stateStr)}&response_type=${encodeURIComponent(responseTypeStr)}`;
    
    res.redirect(consentUrl);

  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export const consent = async (req: Request, res: Response) => {
  const { response_type, client_id, redirect_uri, scope, state, allow } = req.body;

  if (!req.session.userId) {
    res.status(401).json({ error: "login_required" });
    return;
  }

  const redirectUriStr = redirect_uri as string;

  if (allow !== 'true' && allow !== true) {
    res.redirect(`${redirectUriStr}?error=access_denied&state=${state}`);
    return;
  }

  try {
    const responseTypeStr = (response_type as string)?.trim();
    const clientIdStr = client_id as string;
    const scopesArr = (scope as string)?.split(" ").filter(s => s.trim() !== "");
    const stateStr = state as string;

    const response = await authorizeService.generateCode({
      responseType: responseTypeStr,
      clientId: clientIdStr,
      redirectUri: redirectUriStr,
      scopes: scopesArr,
      state: stateStr,
      userId: req.session.userId as string
    });
        
    res.redirect(response.redirect);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}