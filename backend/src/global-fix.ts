import { db } from './db/index';
import { questions } from './db/schema';
import { eq, sql } from 'drizzle-orm';

async function globalFix() {
  const allQuestions = await db.select().from(questions);
  
  for (const q of allQuestions) {
    if (q.type === 'MCQ' && (!q.options || q.options === '[]')) {
      let options = ['Option A', 'Option B', 'Option C', 'Option D'];
      let correct = ['Option A'];
      
      // Specialize some common questions if found
      if (q.content.includes('HTML')) {
        options = ['HyperText Markup Language', 'HighText Machine Language', 'HyperText Marking Language', 'Hyperlink Text Markup Language'];
        correct = ['HyperText Markup Language'];
      } else if (q.content.includes('keyword') && q.content.includes('Python')) {
        options = ['def', 'func', 'function', 'define'];
        correct = ['def'];
      } else if (q.content.includes('data type of [1,2,3]')) {
        options = ['List', 'Array', 'Tuple', 'Set'];
        correct = ['List'];
      } else if (q.content.includes('binary search')) {
        options = ['O(log n)', 'O(n)', 'O(n log n)', 'O(1)'];
        correct = ['O(log n)'];
      } else if (q.content.includes('FIFO')) {
        options = ['Queue', 'Stack', 'Heap', 'Tree'];
        correct = ['Queue'];
      } else if (q.content.includes('interpreted')) {
        options = ['Python', 'C++', 'Java', 'C'];
        correct = ['Python'];
      }

      await db.update(questions)
        .set({ 
          options: JSON.stringify(options),
          correctAnswers: JSON.stringify(correct)
        })
        .where(eq(questions.id, q.id));
      
      console.log(`Fixed options for: ${q.content}`);
    }
  }
}

globalFix().catch(console.error);
