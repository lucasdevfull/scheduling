import { AvailabilitiesRepository } from '@/repositories/availabilities.repository.ts'
import { httpSchema } from '@/schema/http.schema.ts'
import {
  serviceSchema,
  updateServiceSchema,
} from '@/schema/availabilities.schema.ts'
import { AvailabilitiesServices } from '@/services/availabilites.services.ts'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

export const serviceController: FastifyPluginAsyncZod = async fastify => {
  const availabilitiesRepository = new AvailabilitiesRepository()
  const availabilitiesServices = new AvailabilitiesServices(
    availabilitiesRepository
  )
  fastify.get(
    '/services',
    {
      schema: {
        tags: ['services'],
        querystring: z.object({
          limit: z.coerce.number().default(20),
          cursor: z.coerce.number().default(0),
        }),

        response: {
          200: httpSchema.extend({
            data: z
              .array(
                z.object({
                  id: z.number(),
                  name: z.string(),
                  //createdAt: z.iso.datetime(),
                  availabilities: z.array(
                    z.object({
                      id: z.number(),
                      dayId: z.number(),
                      startTime: z.date(),
                      endTime: z.date(),
                    })
                  ),
                })
              )
              .optional(),
            hasNextPage: z.boolean(),
            nextCursor: z.number().nullable(),
          }),
        },
      },
    },
    async ({ query: { limit, cursor } }, reply) => {
      const { result, ...r } =
        await availabilitiesServices.findAllAvailabilities(limit, cursor)
      return reply.send({
        statusCode: 200,
        error: null,
        message: '',
        data: result,
        ...r,
      })
    }
  )
  fastify.post(
    '/services',
    {
      schema: {
        tags: ['services'],
        body: serviceSchema,
        response: {
          201: httpSchema.extend({
            data: z.object({
              serviceId: z.number(),
            }),
          }),
          409: httpSchema,
        },
      },
    },
    async ({ body }, reply) => {
      const { id } = await availabilitiesServices.createAvailiabilities(body)
      return reply.status(201).send({
        statusCode: 201,
        error: null,
        message: 'Serviço criado com sucesso',
        data: {
          serviceId: id,
        },
      })
    }
  )
  fastify.put(
    '/services/:serviceId',
    {
      schema: {
        tags: ['services'],
        params: z.object({
          serviceId: z.number(),
        }),
        body: updateServiceSchema,
        response: {
          200: httpSchema.extend({
            data: updateServiceSchema.extend({
              id: z.number(),
              availabilities: z.array(
                z.object({
                  id: z.number(),
                  dayId: z.number(),
                  startTime: z.date(),
                  endTime: z.date(),
                })
              ),
            }),
          }),
        },
      },
    },
    async ({ body, params: { serviceId } }, reply) => {
      const data = await availabilitiesServices.updateService(serviceId, body)
      return reply.send({
        statusCode: 200,
        error: null,
        message: 'Serviço atualizado com sucesso',
        data,
      })
    }
  )
  fastify.delete(
    '/services/:serviceId',
    {
      schema: {
        tags: ['services'],
        params: z.object({
          serviceId: z.number(),
        }),
        response: {
          204: httpSchema,
        },
      },
    },
    async ({ params: { serviceId } }, reply) => {
      const { message } = await availabilitiesServices.delete(serviceId)
      return reply.status(204).send({
        statusCode: 204,
        error: null,
        message,
      })
    }
  )
}
