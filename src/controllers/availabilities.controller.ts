import { AvailabilitiesRepository } from '@/repositories/availabilities.repository.ts'
import { httpSchema } from '@/schema/http.schema.ts'
import { serviceSchema } from '@/schema/service.schema.ts'
import { AvailabilitiesServices } from '@/services/availabilites.services.ts'
import { encrypt } from '@/utils/crypto.ts'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

export const serviceController: FastifyPluginAsyncZod = async fastify => {
  const availabilitiesRepository = new AvailabilitiesRepository()
  const availabilitiesServices = new AvailabilitiesServices(
    availabilitiesRepository
  )
  fastify.get(
    'services',
    {
      schema: {
        querystring: z.object({
          limit: z.coerce.number().default(20),
          cursor: z.coerce.number().default(0),
        }),

        response: httpSchema.extend(
          z
            .array(
              z.object({
                id: z.string(),
                name: z.string(),
                availabilities: z.array(
                  z.object({
                    id: z.string(),
                    day: z.number(),
                    startTime: z.string(),
                    endTime: z.string(),
                  })
                ),
              })
            )
            .optional()
        ),
      },
    },
    async ({ query: { limit, cursor } }, { send }) => {
      const { result, ...r } =
        await availabilitiesServices.findAllAvailabilities(limit, cursor)
      const data = await Promise.all(
        result.map(({ id, name, availabilities }) => ({
          id: encrypt(String(id)),
          name,
          availabilities: availabilities.map(({ id, ...a }) => ({
            id: encrypt(String(id)),
            ...a,
          })),
        }))
      )
      return send({
        statusCode: 200,
        error: null,
        data: {
          data,
          ...r,
        },
      })
    }
  )
  fastify.post(
    'services',
    {
      schema: {
        body: serviceSchema,
        response: {
          201: httpSchema.extend({
            data: z.object({
              serviceId: z.string(),
            }),
          }),
          409: httpSchema,
        },
      },
    },
    async ({ body }, { status }) => {
      const { serviceId } =
        await availabilitiesServices.createAvailiabilities(body)
      return status(201).send({
        statusCode: 201,
        error: null,
        message: 'Serviço criado com sucesso',
        data: {
          serviceId: encrypt(String(serviceId)),
        },
      })
    }
  )
}
