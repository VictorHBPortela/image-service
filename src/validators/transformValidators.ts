import * as z from 'zod';

const fitOptions = z.enum(['cover', 'contain', 'fill', 'inside', 'outside']);

const transformValidator = z.object({
    resize: z
        .object({
            width: z.number().int().positive(),
            height: z.number().int().positive(),
            fit: fitOptions.optional(),
        })
        .optional(),

    crop: z
        .object({
            left: z.number().int().nonnegative(),
            top: z.number().int().nonnegative(),
            width: z.number().int().positive(),
            height: z.number().int().positive(),
        })
        .optional(),

    rotate: z.number().min(0).max(360).optional(),

    flip: z.boolean().optional(),

    mirror: z.boolean().optional(),

    compress: z
        .object({
            quality: z.number().int().min(1).max(100),
        })
        .optional(),

    format: z.enum(['jpeg', 'png', 'webp']).optional(),

    filters: z
        .object({
            grayscale: z.boolean().optional(),
            sepia: z.boolean().optional(),
        })
        .optional(),
});

export { transformValidator };
