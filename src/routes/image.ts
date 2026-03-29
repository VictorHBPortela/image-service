import express from 'express';
import { ImageController } from '../controllers/ImageController';
import { ImageService } from '../services/ImageService';
import { ImageRepository } from '../repositories/image/ImageRepository';
import { auth } from '../middlewares/auth';
import { multerUpload } from '../helpers/multerUpload';
import { transformLimiter } from '../middlewares/rateLimit';

const router = express.Router({ mergeParams: true });
const repository = new ImageRepository()
const service = new ImageService(repository)
const controller = new ImageController(service);

router.post('/upload', multerUpload, auth, controller.upload);
router.post('/transform/:id', multerUpload, transformLimiter, auth, controller.transform);
router.get('/list', auth, controller.list);
router.get('/delete/:id', auth, controller.delete);

export default router;
