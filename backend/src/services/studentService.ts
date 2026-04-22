import { db } from '../db';
import { users, exams, questions, attempts, answers } from '../db/schema';
import { eq, and, sql, lt, gt, desc, asc } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { AppError } from '../utils/errorHandler';
import { format } from 'date-fns';

export const studentService = {
  async getDashboardStats(studentId: string) {
    const history = await this.getExamHistory(studentId);
    const available = await this.getAvailableExams(studentId);
    
    // Calculate stats
    const totalAttempts = history.length;
    const avgScore = totalAttempts > 0 
      ? Math.round(history.reduce((acc: number, curr: any) => acc + (curr.score || 0), 0) / totalAttempts) 
      : 0;

    // Calculate Platform Rank
    const allStudentScores = await db
      .select({
        studentId: attempts.studentId,
        totalScore: sql<number>`SUM(${attempts.score})`
      })
      .from(attempts)
      .where(eq(attempts.status, 'submitted'))
      .groupBy(attempts.studentId)
      .orderBy(desc(sql`SUM(${attempts.score})`));

    const currentRankIndex = allStudentScores.findIndex(s => s.studentId === studentId);
    const currentRank = currentRankIndex + 1;
    const totalStudents = allStudentScores.length;
    const percentile = totalStudents > 1 
      ? Math.round(((totalStudents - currentRank) / (totalStudents - 1)) * 100) 
      : 100;

    // Performance History (Last 10 exams)
    const performanceHistory = history
      .slice(0, 10)
      .reverse()
      .map((h: any) => ({
        date: format(new Date(h.submittedAt), 'MMM dd'),
        score: h.accuracy, // Use accuracy percentage for the chart
        title: h.examTitle
      }));

    // Topic Analysis (Mocked based on recent results categories)
    // In a real app, you'd aggregate correct answers by question category
    const topics = [
      { name: 'Python', score: 85, total: 100 },
      { name: 'React', score: 45, total: 100 },
      { name: 'SQL', score: 92, total: 100 },
      { name: 'Algorithms', score: 68, total: 100 },
    ];

    // Badges System
    const badges = [];
    if (totalAttempts >= 1) badges.push({ id: 'b1', title: 'First Steps', icon: 'award', color: 'sky', isLocked: false, description: 'Completed your first assessment' });
    if (totalAttempts >= 5) badges.push({ id: 'b2', title: 'Consistent', icon: 'flame', color: 'rose', isLocked: false, description: 'Completed 5+ assessments' });
    if (history.some((h: any) => h.score >= 90)) badges.push({ id: 'b3', title: 'Top Scorer', icon: 'zap', color: 'amber', isLocked: false, description: 'Scored 90%+ in an exam' });
    if (currentRank === 1 && totalStudents > 1) badges.push({ id: 'b4', title: 'Platform King', icon: 'trophy', color: 'indigo', isLocked: false, description: 'Ranked #1 globally' });

    // Global Leaderboard Preview
    const globalLeaderboard = await this.getGlobalLeaderboard(5);

    return {
      upcomingExams: available.filter((e: any) => !e.isAttempted).slice(0, 3),
      recentResults: history.slice(0, 5),
      performanceHistory,
      topicAnalysis: topics,
      globalLeaderboard,
      badges,
      stats: {
        totalAttempts,
        avgScore,
        totalTimeSpent: history.reduce((acc: number, curr: any) => acc + (curr.duration || 0), 0), // Calculate real time
        currentRank: currentRank > 0 ? `#${currentRank}` : 'N/A',
        totalStudents,
        percentile,
        rankTrend: 'up',
        activeMissions: available.filter((e: any) => !e.isAttempted).length
      },
      notifications: [
        { id: 1, type: 'exam', message: 'New Coding Quest: Python Data Structures is now live!', date: new Date() },
        { id: 2, type: 'rank', message: 'You moved up 3 spots in the global leaderboard!', date: new Date() }
      ]
    };
  },

  async getAvailableExams(studentId: string) {
    const now = new Date();
    // Get exams that are currently active
    const allExams = await db.select().from(exams).where(and(gt(exams.endTime, now)));

    const studentAttempts = await db.select().from(attempts).where(eq(attempts.studentId, studentId));

    return allExams.map((exam: any) => {
      const attempt = studentAttempts.find((a: any) => a.examId === exam.id);
      const isSubmitted = attempt?.status === 'submitted';
      
      return {
        ...exam,
        isAttempted: isSubmitted,
        status: isSubmitted ? 'Completed' : 'Available',
        attemptStatus: attempt?.status || 'none'
      };
    });
  },

  async startAttempt(studentId: string, examId: string) {
    const exam = await db.query.exams.findFirst({ where: eq(exams.id, examId) });
    if (!exam) throw new AppError('Exam not found', 404);

    const examQuestions = await db.select().from(questions).where(eq(questions.examId, examId));
    const formattedQuestions = examQuestions.map((q: any) => ({
      id: q.id,
      type: q.type,
      content: q.content,
      options: q.options ? JSON.parse(q.options) : null,
      points: q.points,
    }));

    const existingAttempt = await db.query.attempts.findFirst({
      where: and(eq(attempts.studentId, studentId), eq(attempts.examId, examId)),
    });

    if (existingAttempt) {
      if (existingAttempt.status === 'submitted') {
        throw new AppError('Exam already submitted', 400);
      }
      return { 
        attemptId: existingAttempt.id, 
        startTime: existingAttempt.startTime,
        exam: {
          ...exam,
          questions: formattedQuestions
        }
      };
    }

    const attemptId = uuidv4();
    const startTime = new Date();
    await db.insert(attempts).values({
      id: attemptId,
      examId,
      studentId,
      status: 'ongoing',
      startTime,
    });

    return {
      attemptId,
      startTime,
      exam: {
        ...exam,
        questions: formattedQuestions,
      },
    };
  },

  async saveAnswer(attemptId: string, questionId: string, content: any) {
    const existing = await db.query.answers.findFirst({
      where: and(eq(answers.attemptId, attemptId), eq(answers.questionId, questionId)),
    });

    const contentStr = typeof content === 'string' ? content : JSON.stringify(content);

    if (existing) {
      await db.update(answers).set({ content: contentStr }).where(eq(answers.id, existing.id));
    } else {
      await db.insert(answers).values({
        id: uuidv4(),
        attemptId,
        questionId,
        content: contentStr,
      });
    }
  },

  async submitAttempt(attemptId: string) {
    const attempt = await db.query.attempts.findFirst({ where: eq(attempts.id, attemptId) });
    if (!attempt || attempt.status === 'submitted') throw new AppError('Invalid attempt', 400);

    const studentAnswers = await db.select().from(answers).where(eq(answers.attemptId, attemptId));
    const examQuestions = await db.select().from(questions).where(eq(questions.examId, attempt.examId!));

    let totalScore = 0;

    for (const q of examQuestions as any[]) {
      const studentAns = studentAnswers.find((a: any) => a.questionId === q.id);
      if (!studentAns) continue;

      let isCorrect = false;
      const correctOnes = JSON.parse(q.correctAnswers);
      const studentValue = studentAns.content;

      if (q.type === 'MCQ') {
        const studentChoices = studentValue ? JSON.parse(studentValue) : [];
        isCorrect = Array.isArray(studentChoices) && 
                    studentChoices.length === correctOnes.length && 
                    studentChoices.every(c => correctOnes.includes(c));
      } else if (q.type === 'Short') {
        isCorrect = correctOnes.some((c: string) => c.toLowerCase() === studentValue?.toLowerCase().trim());
      } else if (q.type === 'Coding') {
        // Basic check for coding
        isCorrect = correctOnes.some((c: string) => studentValue?.includes(c.trim()));
      }

      if (isCorrect) {
        totalScore += q.points;
      }

      await db.update(answers).set({ isCorrect, pointsEarned: isCorrect ? q.points : 0 }).where(eq(answers.id, studentAns.id));
    }

    await db.update(attempts).set({
      score: totalScore,
      status: 'submitted',
      endTime: new Date(),
    }).where(eq(attempts.id, attemptId));

    return { score: totalScore };
  },

  async getAttemptResult(studentId: string, examId: string) {
    const attempt = await db.query.attempts.findFirst({
      where: and(eq(attempts.studentId, studentId), eq(attempts.examId, examId), eq(attempts.status, 'submitted')),
    });

    if (!attempt) throw new AppError('Result not found', 404);

    const qResults = await db
      .select({
        questionId: questions.id,
        content: questions.content,
        type: questions.type,
        options: questions.options,
        correctAnswers: questions.correctAnswers,
        studentAnswer: answers.content,
        isCorrect: answers.isCorrect,
        points: questions.points,
        pointsEarned: answers.pointsEarned,
      })
      .from(questions)
      .leftJoin(answers, and(eq(questions.id, answers.questionId), eq(answers.attemptId, attempt.id)))
      .where(eq(questions.examId, examId));

    return {
      score: attempt.score,
      submittedAt: attempt.endTime,
      questions: qResults.map((q: any) => ({
        ...q,
        options: q.options ? JSON.parse(q.options) : null,
        correctAnswers: JSON.parse(q.correctAnswers),
        studentAnswer: q.studentAnswer && (q.type === 'MCQ' ? JSON.parse(q.studentAnswer) : q.studentAnswer)
      }))
    };
  },

  async getLeaderboard(examId: string) {
    // Leaderboard ranking:
    // 1. Higher score
    // 2. Faster submission time (endTime - startTime)
    // 3. Earlier submission timestamp (endTime)
    
    const results = await db
      .select({
        studentName: users.name,
        score: attempts.score,
        startTime: attempts.startTime,
        endTime: attempts.endTime,
      })
      .from(attempts)
      .innerJoin(users, eq(attempts.studentId, users.id))
      .where(and(eq(attempts.examId, examId), eq(attempts.status, 'submitted')))
      .all();

    return results.sort((a, b) => {
      if (b.score! !== a.score!) return b.score! - a.score!;
      
      const timeA = a.endTime!.getTime() - a.startTime!.getTime();
      const timeB = b.endTime!.getTime() - b.startTime!.getTime();
      if (timeA !== timeB) return timeA - timeB;
      
      return a.endTime!.getTime() - b.endTime!.getTime();
    });
  },

  async getGlobalLeaderboard(limit = 5) {
    // Global ranking based on total score across all attempts
    const results = await db
      .select({
        studentId: users.id,
        studentName: users.name,
        totalScore: sql<number>`SUM(${attempts.score})`,
        examsCompleted: sql<number>`COUNT(${attempts.id})`
      })
      .from(attempts)
      .innerJoin(users, eq(attempts.studentId, users.id))
      .where(eq(attempts.status, 'submitted'))
      .groupBy(users.id, users.name)
      .orderBy(desc(sql`SUM(${attempts.score})`))
      .limit(limit);

    return results;
  },

  async getExamHistory(studentId: string) {
    const history = await db
      .select({
        id: attempts.id,
        examId: exams.id,
        examTitle: exams.title,
        score: attempts.score,
        status: attempts.status,
        submittedAt: attempts.endTime,
      })
      .from(attempts)
      .innerJoin(exams, eq(attempts.examId, exams.id))
      .where(and(eq(attempts.studentId, studentId), eq(attempts.status, 'submitted')))
      .orderBy(sql`${attempts.endTime} DESC`);

    // For each attempt, get the total possible marks for the exam
    const formattedHistory = await Promise.all(history.map(async (h) => {
      const examQuestions = await db.select({ points: questions.points }).from(questions).where(eq(questions.examId, h.examId!));
      const totalMarks = examQuestions.reduce((acc, q) => acc + (q.points || 0), 0);
      return {
        ...h,
        totalMarks: totalMarks || 100, // Fallback to 100 if no questions
        accuracy: totalMarks > 0 ? Math.round((h.score! / totalMarks) * 100) : 0
      };
    }));

    return formattedHistory;
  },

  async runCode(code: string, language: string) {
    // Mock code execution
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate delay

    const isError = Math.random() > 0.85;
    const executionTime = (Math.random() * 0.5 + 0.1).toFixed(3);

    if (isError) {
      return {
        success: false,
        error: `SyntaxError: Unexpected token in ${language} execution environment`,
        output: '',
        executionTime
      };
    }

    return {
      success: true,
      output: `[${language.toUpperCase()}] Execution successful!\nOutput:\nHello, World! Processed result for input data.\nMemory used: 24MB`,
      executionTime
    };
  }
};
