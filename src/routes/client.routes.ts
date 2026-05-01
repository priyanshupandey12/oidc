import { Router } from 'express';
import { RegisterClient } from '../controller/client.controller';

const router = Router();

router.post('/register', RegisterClient);

export default router;