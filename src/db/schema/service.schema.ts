import { integer, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { availabilities } from './availabilities.schema.ts'

export const service = pgTable('services', {
  id: integer().primaryKey().notNull().generatedAlwaysAsIdentity(),
  name: varchar({ length: 50 }).notNull().unique(),
  createdAt: timestamp().notNull().defaultNow(),
})

export const serviceRelations = relations(service, ({ many }) => ({
  availabilities: many(availabilities),
}))
