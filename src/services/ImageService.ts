import { IImage } from "../dto/IImage"
import { BadRequestError } from "../errors/MainErrors"
import { awsS3Delete } from "../helpers/awsS3Delete"
import { awsS3Upload } from "../helpers/awsS3Upload"
import { IImageRepository } from "../repositories/image/ImageRepository"

export interface IImageService {
    upload(file: Express.Multer.File, userId: string): Promise<IImage | void>
    list(userId: string): Promise<IImage[]>
    delete(imageId: string, userId: string): Promise<IImage | null>
}

export class ImageService implements IImageService {
    private repository: IImageRepository

    constructor(repository: IImageRepository) {
        this.repository = repository;
    }
    
    async upload(file: Express.Multer.File, userId: string): Promise<IImage | void> {
        if (!file) throw new BadRequestError('Missing file for upload')

        const image = await awsS3Upload(file)
        
        if (image) await this.repository.save(image, userId)
        
        return image
    }

    async list(userId: string): Promise<IImage[]> {
        return await this.repository.list(userId)
    }

    async delete(imageId: string, userId: string): Promise<IImage | null> {
        await awsS3Delete(imageId);
        return await this.repository.delete(imageId, userId);
        
    }
}