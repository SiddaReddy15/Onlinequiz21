import { db } from './db/index';
import { exams } from './db/schema';
import { eq } from 'drizzle-orm';

async function checkExams() {
  const allExams = await db.select().from(exams);
  console.log('--- EXAM DETAILS ---');
  allExams.forEach(e => {
    console.log(`ID: ${e.id}`);
    console.log(`Title: ${e.title}`);
    console.log(`Start: ${e.startTime}`);
    console.log(`End: ${e.endTime}`);
    console.log('-------------------');
  });
}

checkExams().catch(console.error);
