import { db } from './db/index';
import { exams } from './db/schema';
import { eq } from 'drizzle-orm';

async function check() {
  const [exam] = await db.select().from(exams).where(eq(exams.id, 'exam-1'));
  console.log('Exam exam-1:', exam);
}

check().catch(console.error);
