import { db } from './src/db/index.js';
import { exams } from './src/db/schema.js';
import { sql } from 'drizzle-orm';

async function updateExams() {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    await db.update(exams).set({
      endTime: tomorrow,
      startTime: new Date() // Start it now
    });
    
    console.log('--- UPDATED ALL EXAMS TO BE ACTIVE ---');
  } catch (e) {
    console.error(e);
  }
}

updateExams();
