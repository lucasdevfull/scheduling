import { z } from 'zod/v4'

export const loginSchema = z.object({
  email: z.email(),
  password: z.string(),
  //.min(8, { error: 'A senha deve conter no mínimo 8 caracteres' }),
})

export const userSchema = z
  .object({
    name: z.string().min(1, {
      message: 'O username deve ter pelo menos 1 caracteres',
    }),
    email: z.email({ message: 'O email deve ser valido' }),
    password: z.string().min(8, {
      message: 'A senha deve ter pelo menos 8 caracteres',
    }),
  })
  .extend({
    confirmPassword: z
      .string()
      .min(8, { message: 'A senha deve ter pelo menos 8 caracteres' }),
  })
  .refine(({ password, confirmPassword }) => password === confirmPassword, {
    message: 'As senhas devem ser iguais',
    path: ['confirmPassword'],
  })
