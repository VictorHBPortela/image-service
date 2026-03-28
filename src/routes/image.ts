import express from 'express';
import { ImageController } from '../controllers/ImageController';
import multer from 'multer';
import { ImageService } from '../services/ImageService';
import { ImageRepository } from '../repositories/image/ImageRepository';
import { auth } from '../middlewares/auth';

const router = express.Router({ mergeParams: true });
const repository = new ImageRepository()
const service = new ImageService(repository)
const controller = new ImageController(service);

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/upload', upload.single('image'), auth, controller.upload);
router.get('/list', auth, controller.list);
router.post('/:id/transform', upload.single('image'), auth, controller.transform);

export default router;
