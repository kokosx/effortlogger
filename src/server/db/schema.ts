// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { index, pgTableCreator } from "drizzle-orm/pg-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `effortlogger_${name}`);

export const user = createTable('user', (d) => ({
  id: d.integer('id').primaryKey().generatedByDefaultAsIdentity(),
  name: d.varchar('name', { length: 256 }),
  email: d.varchar('email', { length: 256 }).notNull(),
  password: d.text('password').notNull(),
    createdAt: d.timestamp("created_at", { withTimezone: true })
    .$defaultFn(() => new Date())
    .notNull(),

  updatedAt: d.timestamp("updated_at", { withTimezone: true })
    .$onUpdate(() => new Date())
    .notNull(),
}))

export const session = createTable('session', (d) => ({
  id: d.bigserial('id',{ mode: 'number' }).primaryKey(),
  userId: d.integer('user_id').notNull(),
  createdAt: d.timestamp("created_at", { withTimezone: true })
    .$defaultFn(() => new Date())
    .notNull(),

  updatedAt: d.timestamp("updated_at", { withTimezone: true })
    .$onUpdate(() => new Date())
    .notNull(),
}))

export const posts = createTable(
  "post",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    name: d.varchar({ length: 256 }),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => /* @__PURE__ */ new Date())
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [index("name_idx").on(t.name)],
);
