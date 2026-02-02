import express from 'express';
import { UserRepository } from '../repositories/UserRepository';
import { UserController } from '../controllers/UserController';
import { UserService } from '../services/UserService';

const router = express.Router({ mergeParams: true });

const repository = new UserRepository();
const service = new UserService(repository);
const controller = new UserController(service);

router.post('/login', controller.login);
router.post('/register', controller.register);

export default router;
