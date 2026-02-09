import express from 'express';
import { ImageController } from '../controllers/ImageController';
import multer from 'multer';

const router = express.Router({ mergeParams: true });
const controller = new ImageController();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/upload', upload.single('image'), controller.upload);
router.post('/:id/transform', upload.single('image'), controller.transform);

export default router;
