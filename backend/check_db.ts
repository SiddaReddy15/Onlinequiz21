import { db } from './src/db/index.js';
import { sql } from 'drizzle-orm';

async function check() {
  try {
    const tableInfo = await db.run(sql`PRAGMA table_info(questions)`);
    console.log('--- QUESTIONS TABLE INFO ---');
    console.log(tableInfo);
    
    const exams = await db.run(sql`SELECT * FROM exams`);
    console.log('--- EXAMS ---');
    console.log(exams);
  } catch (e) {
    console.error(e);
  }
}

check();
