import { db } from '@/db/index.ts'
import { schema } from '@/db/schema/index.ts'
import { Service } from '@/types/availabilities.types.ts'
import { eq, gt, sql } from 'drizzle-orm'

export class AvailabilitiesRepository {
  async findAll(limit: number, cursor: number) {
    const result = await db
      .select({
        id: schema.service.id,
        name: schema.service.name,
        availabilities: sql<
          {
            id: number
            day: number
            startTime: string
            endTime: string
          }[]
        >`json_agg(
          jsonb_build_object(
            'id', availabilities.id,
            'day', availabilities.day,
            'startTime', availabilities.startTime,
            'endTime', availabilities.endTime,
          )
        )`,
      })
      .from(schema.service)
      .where(cursor ? gt(schema.service.id, cursor) : undefined)
      .limit(limit + 1)
      .leftJoin(
        schema.availabilities,
        eq(schema.availabilities.serviceId, schema.service.id)
      )
      .groupBy(schema.service.id, schema.service.name)

    return {
      result,
      nextCursor: result.length !== 0 ? result[result.length - 1].id : null,
      hasNextPage: result.length > limit ? true : false,
    }
  }

  async create({ name, availabilities }: Service) {
    return db.transaction(async tx => {
      const [{ id }] = await tx
        .insert(schema.service)
        .values({ name })
        .returning()
      return tx
        .insert(schema.availabilities)
        .values(
          availabilities.map(a => ({
            serviceId: id,
            ...a,
          }))
        )
        .returning()
    })
  }
}
