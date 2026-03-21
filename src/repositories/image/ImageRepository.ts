import { IImage } from "../../dto/IImage";
import { Image } from "../../schemas/image";

export interface IImageRepository {
    save(image: IImage): Promise<void>
    list(): Promise<IImage[]>
}

export class ImageRepository {
    constructor() {}

    async save(image: IImage) {
        await Image.create({ ...image })
    }

    async list(): Promise<IImage[]> {
        return await Image.find()
    }
}