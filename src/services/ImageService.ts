import { BadRequestError } from "../errors/MainErrors"
import { awsS3Upload } from "../helpers/awsS3Upload"

export interface IImageService {
    upload(file: Express.Multer.File): Promise<void>
}

export class ImageService implements IImageService {
    constructor() {}
    
    async upload(file: Express.Multer.File): Promise<void> {
        if (!file) throw new BadRequestError('Missing file for upload')
        await awsS3Upload(file)
    }
}