import {discovery} from '../controller/discovery.controller'
import { Router } from 'express';


const router = Router();


router.get('/openid-configuration', discovery);



export default router;

