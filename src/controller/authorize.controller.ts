import { Request,Response } from 'express';
import * as authorizeService from '../services/authorize.service';


export const authorize =  async (req: Request, res: Response) => {

 const { response_type, client_id, redirect_uri, scope, state} = req.query;

 if (!req.session.userId) {
   res.redirect('auth/login');
  return;
}

const response = await authorizeService.authorize({
  responseType: (response_type as string)?.trim(),
  clientId: client_id as string,
  redirectUri: redirect_uri as string,
  scopes:(scope as string)?.split(" ").filter(s => s.trim() !== ""),
  state: state as string,
  userId: req.session.userId as string
});
    
res.redirect(response.redirect);

}