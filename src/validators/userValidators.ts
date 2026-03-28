import * as z from 'zod'

const registerValidator = z.object({
    name: z.string(),
    email: z.email(),
    password: z.string(),   
})

const loginValidator = z.object({
    email: z.email(),
    password: z.string(),   
})

export { registerValidator, loginValidator }