import {authorize, consent} from '../controller/authorize.controller'
import { Router } from 'express';

const router = Router();



router.get('/authorize', authorize)
router.post('/consent', consent)

export default router;