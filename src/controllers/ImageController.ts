import { NextFunction, Request, Response } from 'express';
import {
  badRequestResponse,
  noContentResponse,
  successResponse,
} from '../helpers/responses';
import { IImageService } from '../services/ImageService';
import { BadRequestError } from '../errors/MainErrors';

export class ImageController {
  private service: IImageService;

  constructor(service: IImageService) {
    this.service = service;
  }

  upload = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const { file, user } = req;
      if (!file) throw new BadRequestError('Missing file for upload');

      const image = await this.service.upload(file, user!.id);
      return successResponse(res, 'File uploaded successfully', { image });
    } catch (error) {
      console.error(`Error uploading file ${JSON.stringify(error)}`);
      next(error);
    }
  };

  list = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const userId = req.user!.id;
      const images = await this.service.list(userId);
      if (images.length === 0)
        return noContentResponse(res, `No images found for ${userId}`);

      return successResponse(res, 'List of images', images);
    } catch (error) {
      console.error(`Error uploading file ${JSON.stringify(error)}`);
      next(error);
    }
  };

  delete = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const userId = req.user!.id;
      const imageId = req.params!.id;
      if (!imageId) return badRequestResponse(res, 'Missing image ID');

      const image = await this.service.delete(imageId as string, userId);
      if (!image) return noContentResponse(res, 'No image found with given ID');

      return successResponse(res, 'Image deleted successfully', image);
    } catch (error) {
      console.error(`Error uploading file ${JSON.stringify(error)}`);
      next(error);
    }
  };
}
