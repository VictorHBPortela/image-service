import express from 'express';
import { ImageController } from '../controllers/ImageController';
import multer from 'multer';
import { ImageService } from '../services/ImageService';

const router = express.Router({ mergeParams: true });
const service = new ImageService()
const controller = new ImageController(service);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '/tmp/my-uploads')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix)
  }
})
const upload = multer({ storage });

router.post('/upload', upload.single('image'), controller.upload);
router.post('/:id/transform', upload.single('image'), controller.transform);

export default router;
