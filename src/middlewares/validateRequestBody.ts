import { Request, Response, NextFunction } from "express";
import { ZodType } from "zod";

export const validateRequestBody = (schema: ZodType) => {
    return async (req: Request, res: Response,  next: NextFunction) => {
        try {
            schema.parse(req.body);
            return next();
        } catch (error) {
            return next(error);
        }
    }
};