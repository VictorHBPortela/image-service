import multer, { MulterError } from 'multer';
import { BadRequestError } from '../errors/MainErrors';
import { Request, Response, NextFunction } from 'express';
import { fileFilter } from './fileFilter';

const upload = multer({ storage: multer.memoryStorage(), fileFilter });

export function multerUpload(req: Request, res: Response, next: NextFunction) {
  upload.single('image')(req, res, (err: any) => {
    if (err instanceof MulterError) {
      return next(new BadRequestError(`File upload error: ${err.message}`));
    }
    if (err) return next(err);
    next();
  });
}