import { z } from 'zod'

const regex = /^([01]\d|2[0-3]):([0-5]\d)$/

const availabilitieSchema = z
  .object({
    dayId: z.number(),
    startTime: z.string().regex(regex),
    endTime: z.string().regex(regex),
  })
  .refine(
    data => {
      const [startH, startM] = data.startTime.split(':').map(Number)
      const [endH, endM] = data.endTime.split(':').map(Number)
      return endH > startH || (endH === startH && endM > startM)
    },
    {
      message: 'end_time deve ser maior que start_time',
      path: ['end_time'],
    }
  )

export const serviceSchema = z.object({
  name: z.string(),
  availabilities: z
    .array(availabilitieSchema)
    .min(1, 'Pelo menos uma disponibilidade é necessária'),
})
export const updateServiceSchema = serviceSchema.extend({
  availabilities: z.array(
    availabilitieSchema.safeExtend({
      id: z.number(),
    })
  ),
})
