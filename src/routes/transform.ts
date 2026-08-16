import express from 'express';
import { auth } from '../middlewares/auth';
import { transformLimiter } from '../middlewares/rateLimit';
import { TransformService } from '../services/TransformService';
import { TransformController } from '../controllers/TransformController';
import { ImageService } from '../services/ImageService';
import { ImageRepository } from '../repositories/image/ImageRepository';
import { validateRequestBody } from '../middlewares/validateRequestBody';
import { transformValidator } from '../validators/transformValidators';

const router = express.Router({ mergeParams: true });
const transformService = new TransformService();
const imageService = new ImageService(new ImageRepository());
const controller = new TransformController(transformService, imageService);

router.post(
  '/transform/:id',
  auth,
  transformLimiter,
  validateRequestBody(transformValidator),
  controller.transform,
);

export default router;
