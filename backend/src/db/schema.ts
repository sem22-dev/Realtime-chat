

import { boolean, pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  verificationCode: text('verification_code'),
  isVerified: boolean('is_verified').default(false),
});

export const messages = pgTable('messages', {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").references(() => users.id),
  receiverId: integer("receiver_id").references(() => users.id),
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  read: boolean("read").default(false),
  type: text("type").default('text'),
});

export const userStatus = pgTable('user_status', {
  userId: integer("user_id").references(() => users.id).primaryKey(),
  status: text("status").default('offline'),
  lastSeen: timestamp("last_seen").defaultNow(),
});
