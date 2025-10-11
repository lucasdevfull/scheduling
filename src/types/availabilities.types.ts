import {
  serviceSchema,
  updateServiceSchema,
} from '@/schema/availabilities.schema.ts'
import { z } from 'zod'

export type Service = z.infer<typeof serviceSchema>

export type UpdateService = z.infer<typeof updateServiceSchema>
