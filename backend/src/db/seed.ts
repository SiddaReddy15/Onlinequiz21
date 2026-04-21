import { db } from './index';
import { users, exams, questions, attempts, answers } from './schema';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { eq } from 'drizzle-orm';

async function seed() {
  console.log('Cleaning existing data...');
  try {
    await db.delete(answers);
    await db.delete(attempts);
    await db.delete(questions);
    await db.delete(exams);
    await db.delete(users);
  } catch (e) {
    console.log('Tables might be empty or missing. Proceeding...');
  }

  console.log('Seeding fresh data...');

  // Create Admin
  const adminId = uuidv4();
  const hashedAdminPassword = await bcrypt.hash('admin123', 10);
  await db.insert(users).values({
    id: adminId,
    name: 'System Admin',
    email: 'admin@example.com',
    password: hashedAdminPassword,
    role: 'admin',
  });

  // Create Student
  const studentId = uuidv4();
  const hashedStudentPassword = await bcrypt.hash('student123', 10);
  await db.insert(users).values({
    id: studentId,
    name: 'Sample Student',
    email: 'student@example.com',
    password: hashedStudentPassword,
    role: 'student',
  });

  // Create Sample Exam
  const examId = uuidv4();
  const now = new Date().getTime();
  const startTime = now + 1000 * 60 * 60; // 1 hour later
  const endTime = startTime + 1000 * 60 * 60 * 24; // 24 hours duration

  await db.insert(exams).values({
    id: examId,
    title: 'General Knowledge & Coding 101',
    description: 'A comprehensive exam covering basics of GK and Javascript.',
    duration: 30,
    passingScore: 50,
    startTime: new Date(startTime),
    endTime: new Date(endTime),
    createdBy: adminId,
  });

  // Create Sample Questions
  const questionsData = [
    {
      id: uuidv4(),
      examId,
      type: 'MCQ' as const,
      content: 'What is the capital of France?',
      options: JSON.stringify(['London', 'Berlin', 'Paris', 'Madrid']),
      correctAnswers: JSON.stringify(['Paris']),
      points: 10,
    },
    {
      id: uuidv4(),
      examId,
      type: 'Short' as const,
      content: 'Who developed the Javascript language?',
      correctAnswers: JSON.stringify(['Brendan Eich']),
      points: 20,
    },
    {
      id: uuidv4(),
      examId,
      type: 'Coding' as const,
      content: 'Write a function named "sum" that adds two numbers.',
      correctAnswers: JSON.stringify(['function sum(a, b) { return a + b; }']),
      points: 50,
    }
  ];

  for (const q of questionsData) {
    await db.insert(questions).values(q);
  }

  console.log('Seeding completed successfully!');
}

seed().catch(console.error);
