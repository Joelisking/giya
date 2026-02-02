import {
  pgTable,
  uuid,
  text,
  timestamp,
  jsonb,
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').unique().notNull(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const userProfiles = pgTable(
  'user_profiles',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .references(() => users.id)
      .notNull(),
    data: jsonb('data').notNull(), // Stores the full structured profile JSON
    careers: jsonb('careers'), // Stores Array<CareerPath>
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => {
    return {};
  }
);

export const chatSessions = pgTable('chat_sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .references(() => users.id)
    .notNull(),
  title: text('title').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const chatMessages = pgTable('chat_messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  sessionId: uuid('session_id')
    .references(() => chatSessions.id)
    .notNull(),
  role: text('role').notNull(), // 'user' | 'model'
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const reflections = pgTable('reflections', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .references(() => users.id)
    .notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const savedPaths = pgTable('saved_paths', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .references(() => users.id)
    .notNull(),
  careerId: text('career_id').notNull(), // References the career ID from careers array
  savedAt: timestamp('saved_at').defaultNow(),
});

export const savedPreviews = pgTable('saved_previews', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .references(() => users.id)
    .notNull(),
  careerId: text('career_id').notNull(),
  careerTitle: text('career_title').notNull(),
  scenes: jsonb('scenes').notNull(), // Array of StoryScene
  createdAt: timestamp('created_at').defaultNow(),
});

export const milestones = pgTable('milestones', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .references(() => users.id)
    .notNull(),
  careerId: text('career_id').notNull(),
  milestoneId: text('milestone_id').notNull(), // Timeline event ID
  completedAt: timestamp('completed_at').defaultNow(),
});

export const growthCheckpoints = pgTable('growth_checkpoints', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .references(() => users.id)
    .notNull(),
  type: text('type').notNull(), // 'annual' | 'skill' | 'goal'
  lastPromptedAt: timestamp('last_prompted_at'),
  nextPromptAt: timestamp('next_prompt_at'),
});

export const sharedPlans = pgTable('shared_plans', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .references(() => users.id)
    .notNull(),
  shareToken: text('share_token').unique().notNull(),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow(),
});
