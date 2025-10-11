import { prisma } from '@/db/index.ts'
import { Service, UpdateService } from '@/types/availabilities.types.ts'

export class AvailabilitiesRepository {
  async findAll(limit: number, cursor: number) {
    const result = await prisma.service.findMany({
      where: cursor ? { id: { gt: cursor } } : undefined,
      take: limit + 1,
      orderBy: { id: 'asc' },
      include: {
        availabilities: {
          select: {
            id: true,
            dayId: true,
            startTime: true,
            endTime: true,
          },
        },
      },
    })

    return {
      result,
      nextCursor: result.length !== 0 ? result[result.length - 1].id : null,
      hasNextPage: result.length > limit ? true : false,
    }
  }

  async create({ name, availabilities }: Service) {
    return prisma.$transaction(async tx => {
      const service = await tx.service.create({
        data: {
          name,
          availabilities: {
            create: availabilities.map(a => ({
              dayId: a.day,
              startTime: a.startTime,
              endTime: a.endTime,
            })),
          },
        },
        include: { availabilities: true }, // retorna service + availabilities
      })
      return service
    })
  }

  async findById(id: number) {
    const data = await prisma.service.findUnique({
      where: { id },
      include: {
        availabilities: {
          select: {
            id: true,
            dayId: true,
            startTime: true,
            endTime: true,
          },
        },
      },
    })
    return data
  }

  async findAvailabilitiesById(id: number, serviceId: number) {
    const data = await prisma.availability.findUnique({
      where: { id, serviceId },
    })
    return data
  }

  async findByName(name: string) {
    const data = await prisma.service.findFirst({
      where: { name },
      include: {
        availabilities: {
          select: {
            id: true,
            dayId: true,
            startTime: true,
            endTime: true,
          },
        },
      },
    })
    return data
  }
  async update(id: number, data: UpdateService) {
    return prisma.service.update({
      where: { id },
      data: {
        name: data.name,
        availabilities: {
          // Itera sobre cada disponibilidade recebida
          upsert: data.availabilities.map(a => ({
            where: { id: a.id ?? 0 }, // se não tiver id, esse valor não vai achar nada
            update: {
              dayId: a.day,
              startTime: a.startTime,
              endTime: a.endTime,
            },
            create: {
              dayId: a.day,
              startTime: a.startTime,
              endTime: a.endTime,
            },
          })),
        },
      },
      include: { availabilities: true },
    })
  }
  async delete(id: number) {
    return prisma.service.delete({
      where: {
        id,
      },
    })
  }

  async deleteAvailabilities(id: number, serviceId: number) {
    return prisma.availability.delete({
      where: {
        serviceId,
        id,
      },
    })
  }
}
