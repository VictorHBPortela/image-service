import multer from 'multer';
import { Request } from 'express';
import { BadRequestError } from '../errors/MainErrors';

const ACCEPTED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

const EXTENSION_TO_MIME: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
};

export function resolveImageContentType(
  file: Pick<Express.Multer.File, 'mimetype' | 'originalname'>,
): string | undefined {
  const mimetype = file.mimetype?.toLowerCase();
  if (mimetype && mimetype !== 'application/octet-stream') {
    return mimetype;
  }

  const extension = file.originalname.split('.').at(-1)?.toLowerCase();
  if (!extension) return undefined;

  return EXTENSION_TO_MIME[extension];
}

export function fileFilter(
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) {
  const contentType = resolveImageContentType(file);

  if (!contentType || !ACCEPTED_MIME_TYPES.has(contentType)) {
    cb(
      new BadRequestError(
        'Unsupported file type. Accepted: jpeg, png, webp, gif',
      ),
    );
    return;
  }

  cb(null, true);
}
