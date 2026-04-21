import { db } from './src/db/index.js';
import { sql } from 'drizzle-orm';

async function migrate() {
  try {
    console.log('--- ADDING CATEGORY COLUMN ---');
    await db.run(sql`ALTER TABLE questions ADD COLUMN category TEXT DEFAULT 'General'`);
    console.log('--- ADDING CONSTRAINTS COLUMN ---');
    await db.run(sql`ALTER TABLE questions ADD COLUMN constraints TEXT`);
    console.log('--- SUCCESS ---');
  } catch (e) {
    console.error(e);
  }
}

migrate();
