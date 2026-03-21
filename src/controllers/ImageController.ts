import { Request, Response } from 'express';
import { awsS3Upload } from '../helpers/awsS3Upload';
import {
  errorResponse,
  noContentResponse,
  successResponse,
} from '../helpers/responses';
import { IImageService } from '../services/ImageService';

export class ImageController {
  private service: IImageService

  constructor(service: IImageService) {
    this.service = service
  }

  upload = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { file } = req;
      if (file) {
        await this.service.upload(file)
        return successResponse(res, 'File uploaded successfully');
      }
      return noContentResponse(res, 'Missing file for upload')
    } catch (error) {
      console.error(`Error uploading file ${JSON.stringify(error)}`);
      return errorResponse(res, 'Error occurred on file upload');
    }
  };

  list = async (req: Request, res: Response): Promise<Response> => {
    try {
        const images = await this.service.list()
        if (images.length === 0) return noContentResponse(res, 'No images found')
        
        return successResponse(res, 'File uploaded successfully');
    } catch (error) {
      console.error(`Error uploading file ${JSON.stringify(error)}`);
      return errorResponse(res, 'Error occurred on file upload');
    }
  };

  transform = async () => {
    return null;
  };
}
