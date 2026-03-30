type IFitOptions = 'cover' | 'contain' | 'fill' | 'inside' | 'outside';

interface ITransformOptions {
    resize?: { width: number, height: number, fit?: IFitOptions },
    crop?: { left: number, top: number, width: number, height: number }, 
    rotate?: number, 
    flip?: boolean,
    mirror?: boolean, 
    compress?: { quality: number },
    format?: 'jpeg' | 'png' | 'webp',
    filters?: { grayscale?: boolean, sepia?: boolean },
}

export { ITransformOptions }