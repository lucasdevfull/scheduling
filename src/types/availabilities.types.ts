import { serviceSchema } from '@/schema/service.schema.ts'
import { z } from 'zod'

export type Service = z.infer<typeof serviceSchema>
