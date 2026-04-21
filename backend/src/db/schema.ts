import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  role: text('role', { enum: ['admin', 'student'] }).notNull().default('student'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

export const exams = sqliteTable('exams', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  duration: integer('duration').notNull(), // in minutes
  passingScore: integer('passing_score').notNull(),
  startTime: integer('start_time', { mode: 'timestamp' }).notNull(),
  endTime: integer('end_time', { mode: 'timestamp' }).notNull(),
  createdBy: text('created_by').references(() => users.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

export const questions = sqliteTable('questions', {
  id: text('id').primaryKey(),
  examId: text('exam_id').references(() => exams.id, { onDelete: 'cascade' }),
  type: text('type', { enum: ['MCQ', 'Short', 'Coding'] }).notNull(),
  category: text('category').default('General'),
  content: text('content').notNull(),
  options: text('options'), // JSON string for MCQ options
  correctAnswers: text('correct_answers').notNull(), // JSON string for correct answers
  constraints: text('constraints'), // JSON string for coding constraints
  points: integer('points').notNull().default(1),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

export const attempts = sqliteTable('attempts', {
  id: text('id').primaryKey(),
  examId: text('exam_id').references(() => exams.id, { onDelete: 'cascade' }),
  studentId: text('student_id').references(() => users.id, { onDelete: 'cascade' }),
  startTime: integer('start_time', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
  endTime: integer('end_time', { mode: 'timestamp' }),
  score: integer('score').default(0),
  status: text('status', { enum: ['ongoing', 'submitted'] }).default('ongoing'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

export const answers = sqliteTable('answers', {
  id: text('id').primaryKey(),
  attemptId: text('attempt_id').references(() => attempts.id, { onDelete: 'cascade' }),
  questionId: text('question_id').references(() => questions.id, { onDelete: 'cascade' }),
  content: text('content'), // student response
  isCorrect: integer('is_correct', { mode: 'boolean' }).default(false),
  pointsEarned: integer('points_earned').default(0),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});
