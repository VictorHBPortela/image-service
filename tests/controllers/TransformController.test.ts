import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { NextFunction, Request, Response } from 'express';
import { TransformController } from '../../src/controllers/TransformController';
import { ITransformOptions } from '../../src/dto/ITransformOptions';
import { IImageReader, RetrievedImage } from '../../src/services/ImageService';
import { ITransformService } from '../../src/services/TransformService';

describe('TransformController', () => {
  it('retrieves the image by route id and responds with the transformed bytes', async () => {
    const source = Buffer.from('source image');
    const transformed = Buffer.from('transformed image');
    const options: ITransformOptions = {
      format: 'webp',
      resize: { width: 320, height: 240 },
    };
    let retrievedImageId: string | undefined;
    let transformInput:
      { buffer: Buffer; options: ITransformOptions } | undefined;

    const imageReader = createImageReader(async (imageId) => {
      retrievedImageId = imageId;
      return { buffer: source, contentType: 'image/png' };
    });
    const transformService: ITransformService = {
      transform: async (buffer, receivedOptions) => {
        transformInput = { buffer, options: receivedOptions };
        return transformed;
      },
    };
    const response = createResponse();
    const controller = new TransformController(transformService, imageReader);

    await controller.transform(
      { params: { id: 'image-123' }, body: options } as unknown as Request,
      response.value,
      response.next,
    );

    assert.equal(retrievedImageId, 'image-123');
    assert.deepEqual(transformInput, { buffer: source, options });
    assert.equal(response.headers['Content-Type'], 'image/webp');
    assert.equal(response.sentBody, transformed);
    assert.equal(response.forwardedError, undefined);
  });
});

function createImageReader(
  getImage: (imageId: string) => Promise<RetrievedImage>,
): IImageReader {
  return { getImage };
}

function createResponse(): {
  value: Response;
  next: NextFunction;
  headers: Record<string, string>;
  sentBody?: Buffer;
  forwardedError?: unknown;
} {
  const state = {
    headers: {} as Record<string, string>,
    sentBody: undefined as Buffer | undefined,
    forwardedError: undefined as unknown,
  };
  const value = {
    setHeader(name: string, value: string) {
      state.headers[name] = value;
      return this;
    },
    send(body: Buffer) {
      state.sentBody = body;
      return this;
    },
  } as unknown as Response;
  const next: NextFunction = (error?: unknown) => {
    state.forwardedError = error;
  };

  return Object.assign(state, { value, next });
}
