import { Register,Login ,Logout} from '../controller/auth.controller';
import { Router } from 'express';

const router = Router();


router.post('/register', Register);
router.post('/login', Login);
router.post('/logout', Logout);


export default router;
