import crypto from 'crypto'

export function generateImageId(): crypto.UUID {
    return crypto.randomUUID();
}