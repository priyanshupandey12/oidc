import { jwks } from '../controller/jwks.controller';
import { Router } from 'express';

const router = Router();

router.get('/jwks.json', jwks);

export default router;