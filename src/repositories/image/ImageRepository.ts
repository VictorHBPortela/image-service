import { IImage } from "../../dto/IImage";
import { Image } from "../../schemas/image";

export interface IImageRepository {
    save(image: IImage, userId: string): Promise<void>
    list(userId: string): Promise<IImage[]>
    delete(imageId: string, userId: string): Promise<IImage | null>
}

export class ImageRepository {
    constructor() {}

    async save(image: IImage, userId: string): Promise<void> {
        await Image.create({ ...image, userId })
    }

    async list(userId: string): Promise<IImage[]> {
        return await Image.find({ userId })
    }

    async delete(imageId: string, userId: string): Promise<IImage | null> {
        return await Image.findOneAndDelete({ imageId, userId })
    }
}