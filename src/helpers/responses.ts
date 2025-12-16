import { Response } from 'express';
import { STATUS_CODE } from '../shared/constants';

export interface IResponse {
  message: string;
  data?: Record<string, any>;
}

function successResponse(
  res: Response,
  message: string,
  data?: Record<string, any>,
): Response {
  const responseJSON = { status: 'success', message, data };
  if (data) responseJSON.data = data;
  return res.status(STATUS_CODE.SUCCESS).json(responseJSON);
}

function createdResponse(
  res: Response,
  message: string,
  data?: Record<string, any>,
): Response {
  const responseJSON = { status: 'success', message, data };
  if (data) responseJSON.data = data;
  return res.status(STATUS_CODE.CREATED).json(responseJSON);
}

function badRequestResponse(
  res: Response,
  message: string,
  data?: Record<string, any>,
): Response {
  const responseJSON = { status: 'error', message, data };
  if (data) responseJSON.data = data;
  return res.status(STATUS_CODE.BAD_REQUEST).json(responseJSON);
}

function unauthorizedResponse(
  res: Response,
  message: string,
  data?: Record<string, any>,
): Response {
  const responseJSON = { status: 'error', message, data };
  if (data) responseJSON.data = data;
  return res.status(STATUS_CODE.UNAUTHORIZED).json(responseJSON);
}

function forbiddenResponse(
  res: Response,
  message: string,
  data?: Record<string, any>,
): Response {
  const responseJSON = { status: 'error', message, data };
  if (data) responseJSON.data = data;
  return res.status(STATUS_CODE.UNAUTHORIZED).json(responseJSON);
}

export {
  successResponse,
  createdResponse,
  badRequestResponse,
  unauthorizedResponse,
  forbiddenResponse,
};
