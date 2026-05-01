import {authorize} from '../controller/authorize.controller'
import { Router } from 'express';

const router = Router();



router.get('/authorize', authorize)


export default router;