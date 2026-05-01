import {userinfo} from '../controller/userinfo.controller';
import { Router } from 'express';

const router = Router();


router.get('/userinfo', userinfo);


export default router;