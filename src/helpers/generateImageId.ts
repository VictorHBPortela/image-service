import bcrypt from 'bcrypt'

export async function generateImageId(fileName: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(fileName, saltRounds);
}