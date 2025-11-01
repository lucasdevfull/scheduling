import { z } from 'zod'

const regex = /^([01]\d|2[0-3]):([0-5]\d)$/

const availabilitieSchema = z
  .object({
    dayId: z.number(),
    startTime: z.string().regex(regex),
    endTime: z.string().regex(regex),
  })
  .superRefine((obj, ctx) => {
    const [startH, startM] = obj.startTime.split(':').map(Number)
    const [endH, endM] = obj.endTime.split(':').map(Number)
    if (endH < startH || (endH === startH && endM <= startM)) {
      ctx.addIssue({
        code: 'custom',
        message: 'end_time deve ser maior que start_time',
        path: ['endTime'],
      })
    }
  })

// agora usamos safeExtend (em vez de extend) para criar a versão com id
export const availabilitieWithIdSchema = availabilitieSchema.safeExtend({
  id: z.number(),
})

export const serviceSchema = z.object({
  name: z.string(),
  availabilities: z
    .array(availabilitieSchema)
    .min(1, 'Pelo menos uma disponibilidade é necessária'),
})

export const updateServiceSchema = serviceSchema.extend({
  availabilities: z
    .array(availabilitieWithIdSchema)
    .min(1, 'Pelo menos uma disponibilidade é necessária'),
})
