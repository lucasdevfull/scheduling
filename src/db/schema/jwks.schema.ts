import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const jwkss = pgTable('jwkss', {
  id: text('id').primaryKey(),
  publicKey: text('public_key').notNull(),
  privateKey: text('private_key').notNull(),
  createdAt: timestamp('created_at').notNull(),
})
