import { IImage } from "../dto/IImage"
import { BadRequestError } from "../errors/MainErrors"
import { awsS3Upload } from "../helpers/awsS3Upload"
import { IImageRepository } from "../repositories/image/ImageRepository"

export interface IImageService {
    upload(file: Express.Multer.File): Promise<IImage | void>
    list(): Promise<IImage[]>
}

export class ImageService implements IImageService {
    private repository: IImageRepository

    constructor(repository: IImageRepository) {
        this.repository = repository;
    }
    
    async upload(file: Express.Multer.File): Promise<IImage | void> {
        if (!file) throw new BadRequestError('Missing file for upload')

        const image = await awsS3Upload(file)
        
        if (image) await this.repository.save(image)
    }

    async list(): Promise<IImage[]> {
        return await this.repository.list()
    }
}