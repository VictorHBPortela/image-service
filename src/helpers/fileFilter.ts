import multer from "multer"
import { Request } from "express"
import { BadRequestError } from "../errors/MainErrors"

export function fileFilter (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) {
    const acceptedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!acceptedTypes.includes(file.mimetype)) {
        cb(new BadRequestError('Unsupported file type. Accepted: jpeg, png, webp, gif'));
        return
    }

    cb(null, true)
}