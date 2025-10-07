import { relations } from 'drizzle-orm'
import { integer, pgTable, varchar } from 'drizzle-orm/pg-core'
import { availabilities } from './availabilities.schema.ts'

export const day = pgTable('day', {
  id: integer().primaryKey().notNull().generatedAlwaysAsIdentity(),
  name: varchar({ length: 20 }).unique().notNull(),
})

export const dayRelations = relations(day, ({ many }) => ({
  availabilities: many(availabilities),
}))
