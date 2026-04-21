import { db } from './db/index';
import { questions, exams } from './db/schema';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

async function seedProperQuestions() {
  const examId = '12278d79-5c44-453d-84b6-6ea5fbed62a0';
  
  // Delete existing questions for this exam
  await db.delete(questions).where(eq(questions.examId, examId));
  
  const qList = [
    {
      id: uuidv4(),
      examId,
      type: 'MCQ' as const,
      category: 'Web Development',
      content: 'What does HTML stand for?',
      options: JSON.stringify(['HyperText Markup Language', 'HighText Machine Language', 'HyperText Marking Language', 'Hyperlink Text Markup Language']),
      correctAnswers: JSON.stringify(['HyperText Markup Language']),
      points: 10
    },
    {
      id: uuidv4(),
      examId,
      type: 'MCQ' as const,
      category: 'Programming',
      content: 'Which language is used for styling web pages?',
      options: JSON.stringify(['HTML', 'CSS', 'JavaScript', 'XML']),
      correctAnswers: JSON.stringify(['CSS']),
      points: 10
    },
    {
      id: uuidv4(),
      examId,
      type: 'Coding' as const,
      category: 'Algorithms',
      content: 'Write a function to return the sum of two numbers.',
      options: null,
      correctAnswers: JSON.stringify(['return a + b', 'return a+b']),
      points: 20
    }
  ];

  for (const q of qList) {
    await db.insert(questions).values(q);
  }

  console.log('Successfully seeded proper questions for exam:', examId);
}

seedProperQuestions().catch(console.error);
