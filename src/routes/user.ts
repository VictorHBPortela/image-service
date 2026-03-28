import express from 'express';
import { UserRepository } from '../repositories/user/UserRepository';
import { UserController } from '../controllers/UserController';
import { UserService } from '../services/UserService';
import { loginValidator, registerValidator } from '../validators/userValidators';
import { validateRequestBody } from '../middlewares/validateRequestBody';

const router = express.Router({ mergeParams: true });

const repository = new UserRepository();
const service = new UserService(repository);
const controller = new UserController(service);

router.post('/login', validateRequestBody(loginValidator), controller.login);
router.post('/register', validateRequestBody(registerValidator), controller.register);
router.post('/refresh', controller.refresh);

export default router;
