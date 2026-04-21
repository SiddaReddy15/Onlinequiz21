import { db } from '../db/index';
import { users, exams, questions, attempts, answers } from '../db/schema';
import { eq, sql, count } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

export const adminService = {
  // ... existing methods ...
  
  async createStudent(data: any) {
    const { name, email, password } = data;
    const hashedPassword = await bcrypt.hash(password, 10);
    const id = uuidv4();
    
    await db.insert(users).values({
      id,
      name,
      email,
      password: hashedPassword,
      role: 'student',
    });
    
    return { id, name, email, role: 'student' };
  },

  async getDashboardStats() {
    const [examsCount] = await db.select({ value: count() }).from(exams);
    const [usersCount] = await db.select({ value: count() }).from(users).where(eq(users.role, 'student'));
    const [submissionsCount] = await db.select({ value: count() }).from(attempts).where(eq(attempts.status, 'submitted'));
    
    const upcomingExams = await db.select()
      .from(exams)
      .where(sql`${exams.startTime} > CURRENT_TIMESTAMP`)
      .orderBy(exams.startTime)
      .limit(5);

    const recentActivity = await db.select({
      id: attempts.id,
      studentName: users.name,
      examTitle: exams.title,
      score: attempts.score,
      status: attempts.status,
      timestamp: attempts.updatedAt
    })
    .from(attempts)
    .innerJoin(users, eq(attempts.studentId, users.id))
    .innerJoin(exams, eq(attempts.examId, exams.id))
    .orderBy(sql`${attempts.updatedAt} DESC`)
    .limit(5);

    return {
      exams: examsCount.value,
      users: usersCount.value,
      submissions: submissionsCount.value,
      upcomingExams,
      recentActivity
    };
  },

  async createExam(data: any) {
    const id = uuidv4();
    await db.insert(exams).values({
      id,
      title: data.title,
      description: data.description,
      duration: parseInt(data.duration),
      passingScore: parseInt(data.passingScore),
      startTime: new Date(data.startTime),
      endTime: new Date(data.endTime),
      createdBy: data.createdBy,
    });
    return { id, ...data };
  },

  async getAllExams() {
    const results = await db.select().from(exams).orderBy(sql`${exams.createdAt} DESC`);
    console.log('--- FETCHING ALL EXAMS ---');
    console.log(JSON.stringify(results, null, 2));
    return results;
  },

  async addQuestions(examId: string, questionList: any[]) {
    const values = questionList.map((q: any) => ({
      id: uuidv4(),
      examId,
      type: q.type,
      category: q.category || 'General',
      content: q.content,
      options: q.type === 'MCQ' ? JSON.stringify(q.options) : null,
      correctAnswers: JSON.stringify(q.correctAnswers),
      constraints: q.constraints ? JSON.stringify(q.constraints) : null,
      points: parseInt(q.points),
    }));

    await db.insert(questions).values(values);
    return { message: 'Questions added successfully' };
  },

  async getAnalytics() {
    const allAnswers = await db.select({
      category: questions.category,
      isCorrect: answers.isCorrect,
    })
    .from(answers)
    .innerJoin(questions, eq(answers.questionId, questions.id));

    const stats: Record<string, { correct: number, total: number }> = {};
    
    allAnswers.forEach((ans: any) => {
      const cat = ans.category || 'General';
      if (!stats[cat]) stats[cat] = { correct: 0, total: 0 };
      stats[cat].total++;
      if (ans.isCorrect) stats[cat].correct++;
    });

    const accuracyData = Object.keys(stats).map((name: string) => ({
      name,
      acc: Math.round((stats[name].correct / stats[name].total) * 100)
    }));

    return { accuracyData };
  },

  async getResults() {
    return await db
      .select({
        id: attempts.id,
        examTitle: exams.title,
        studentName: users.name,
        score: attempts.score,
        status: attempts.status,
        submittedAt: attempts.endTime,
      })
      .from(attempts)
      .innerJoin(exams, eq(attempts.examId, exams.id))
      .innerJoin(users, eq(attempts.studentId, users.id))
      .where(eq(attempts.status, 'submitted'))
      .orderBy(sql`${attempts.endTime} DESC`);
  },

  async updateExam(id: string, data: any) {
    await db.update(exams).set({
      title: data.title,
      description: data.description,
      duration: parseInt(data.duration),
      passingScore: parseInt(data.passingScore),
      startTime: new Date(data.startTime),
      endTime: new Date(data.endTime),
      updatedAt: new Date(),
    }).where(eq(exams.id, id));
    return { id, ...data };
  },

  async updateQuestions(examId: string, questionList: any[]) {
    // Delete existing questions
    await db.delete(questions).where(eq(questions.examId, examId));
    
    // Add new ones
    return await this.addQuestions(examId, questionList);
  },

  async deleteExam(id: string) {
    await db.delete(exams).where(eq(exams.id, id));
    return { message: 'Exam deleted successfully' };
  },

  async getExamById(id: string) {
    const [exam] = await db.select().from(exams).where(eq(exams.id, id));
    if (!exam) return null;

    const examQuestions = await db.select().from(questions).where(eq(questions.examId, id));

    return {
      ...exam,
      questions: examQuestions.map((q: any) => ({
        ...q,
        options: q.options ? JSON.parse(q.options) : [],
        correctAnswers: JSON.parse(q.correctAnswers),
        constraints: q.constraints ? JSON.parse(q.constraints) : null,
      })),
    };
  },

  async getAllStudents() {
    return await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      createdAt: users.createdAt
    })
    .from(users)
    .where(eq(users.role, 'student'))
    .orderBy(sql`${users.createdAt} DESC`);
  },
};
