import { Request, Response } from 'express';
import { awsS3Upload } from '../helpers/awsS3Upload';
import {
  errorResponse,
  noContentResponse,
  successResponse,
} from '../helpers/responses';

export class ImageController {
  upload = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { file } = req;
      if (file) {
        await awsS3Upload(file);
        return successResponse(res, 'File uploaded successfully');
      }
      return noContentResponse(res, 'No files provided for upload');
    } catch (error) {
      console.error(`Error uploading file ${JSON.stringify(error)}`);
      return errorResponse(res, 'Error occurred on file upload');
    }
  };

  transform = async () => {
    return null;
  };
}
