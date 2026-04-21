import { db } from './db/index';
import { exams } from './db/schema';
import { eq } from 'drizzle-orm';

async function fixPythonExam() {
  const pythonId = 'bc724489-65d2-435c-8f60-280f0d12e05f';
  
  // Set end time to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  await db.update(exams)
    .set({ endTime: tomorrow })
    .where(eq(exams.id, pythonId));

  console.log('Successfully updated Python exam end time to:', tomorrow);
}

fixPythonExam().catch(console.error);
