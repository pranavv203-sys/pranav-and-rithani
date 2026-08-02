import { pgTable, serial, text, boolean, integer, timestamp } from "drizzle-orm/pg-core"

export const rsvps = pgTable("rsvps", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  attending: boolean("attending").notNull().default(true),
  guests: integer("guests").notNull().default(1),
  message: text("message"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})

export type Rsvp = typeof rsvps.$inferSelect
