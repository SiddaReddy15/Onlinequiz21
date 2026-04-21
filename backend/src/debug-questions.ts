import { db } from './db/index';
import { questions } from './db/schema';

async function checkQuestions() {
  const allQuestions = await db.select().from(questions);
  console.log('--- ALL QUESTIONS ---');
  allQuestions.forEach(q => {
    console.log(`ID: ${q.id}`);
    console.log(`Type: ${q.type}`);
    console.log(`Content: ${q.content}`);
    console.log(`Options: ${q.options}`);
    console.log('-------------------');
  });
}

checkQuestions().catch(console.error);
