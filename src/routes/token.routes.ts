import {token} from  '../controller/token.controller'
import { Router } from 'express';


const router = Router();

router.post('/token', token);

export default router;