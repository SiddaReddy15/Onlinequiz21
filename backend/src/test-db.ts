import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
dotenv.config();

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

async function test() {
  try {
    const rs = await client.execute('SELECT 1');
    console.log('Success:', rs);
  } catch (e) {
    console.error('Failure:', e);
  }
}
test();
