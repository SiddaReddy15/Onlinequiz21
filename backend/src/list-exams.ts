import { db } from './db';
import { exams } from './db/schema';

async function listExams() {
  const allExams = await db.select().from(exams);
  console.log('--- ALL EXAMS ---');
  allExams.forEach(e => {
    console.log(`ID: [${e.id}] Title: [${e.title}]`);
  });
  console.log('--- END ---');
}

listExams();
