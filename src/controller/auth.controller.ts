import { Request,Response } from "express";
import { register,login,logout } from "../services/auth.service";


export const Register = async (req:Request,res:Response) => {
    const  response = await register(req.body.name as string,req.body.passwordHash as string,req.body.email as string)
    req.session.userId = response.user.id;
    res.json(response)
}


export const Login = async (req: Request, res: Response) => {
  const response = await login(req.body.passwordHash as string, req.body.email as string);
  req.session.userId = response.user.id;
    res.json(response);
}


export const Logout = async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId;

    if (!userId) {
      res.status(401).json({ error: 'Not logged in' });
      return;
    }


    await logout(userId);

   
    req.session.destroy((err) => {
      if (err) {
        res.status(500).json({ error: 'Logout failed' });
        return;
      }
  
      res.clearCookie('connect.sid');
      res.json({ message: 'Logged out successfully' });
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};