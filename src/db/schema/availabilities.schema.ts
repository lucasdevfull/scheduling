import { check, integer, pgTable, time, timestamp } from 'drizzle-orm/pg-core'
import { day } from './days.schema.ts'
import { service } from './service.schema.ts'
import { gt, relations, sql } from 'drizzle-orm'

export const availabilities = pgTable(
  'availabilities',
  {
    id: integer().primaryKey().notNull().generatedAlwaysAsIdentity(),
    serviceId: integer()
      .references(() => service.id, { onDelete: 'restrict' })
      .notNull(),
    day: integer()
      .references(() => day.id, { onDelete: 'restrict' })
      .notNull(),
    startTime: time().notNull(),
    endTime: time().notNull(),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp().defaultNow().notNull(),
  },
  table => ({
    endAfterStart: check(
      'time_check',
      sql`${table.endTime} > ${table.startTime}`
    ),
  })
)

export const availabilitiesRelations = relations(availabilities, ({ one }) => ({
  service: one(service),
  day: one(day),
}))
