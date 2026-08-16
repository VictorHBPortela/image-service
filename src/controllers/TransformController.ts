import { NextFunction, Request, Response } from 'express';
import { ITransformOptions } from '../dto/ITransformOptions';
import { BadRequestError } from '../errors/MainErrors';
import { ITransformService } from '../services/TransformService';
import { IImageReader } from '../services/ImageService';

const FORMAT_CONTENT_TYPES: Record<
  NonNullable<ITransformOptions['format']>,
  string
> = {
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};

export class TransformController {
  private transformService: ITransformService;
  private imageReader: IImageReader;

  constructor(transformService: ITransformService, imageReader: IImageReader) {
    this.transformService = transformService;
    this.imageReader = imageReader;
  }

  transform = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const imageId = req.params.id;
      if (typeof imageId !== 'string' || !imageId) {
        throw new BadRequestError('Missing image ID');
      }

      const options: ITransformOptions = req.body;
      const image = await this.imageReader.getImage(imageId);
      const transformed = await this.transformService.transform(
        image.buffer,
        options,
      );
      const contentType = resolveContentType(options, image.contentType);

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Length', transformed.length.toString());
      return res.send(transformed);
    } catch (error) {
      next(error);
    }
  };
}

function resolveContentType(
  options: ITransformOptions,
  sourceContentType: string,
): string {
  if (options.format) return FORMAT_CONTENT_TYPES[options.format];
  if (options.compress) return FORMAT_CONTENT_TYPES.jpeg;
  return sourceContentType;
}
