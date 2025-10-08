import { serviceSchema } from '@/schema/availabilities.schema.ts'
import { z } from 'zod'

export type Service = z.infer<typeof serviceSchema>
