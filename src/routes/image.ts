import express from 'express';
import { ImageController } from '../controllers/ImageController';

const router = express.Router({ mergeParams: true });
const controller = new ImageController();

router.post('/images', controller.upload);
router.post('images/:id/transform', controller.transform);

export default router;
