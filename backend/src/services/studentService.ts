import { db } from '../db';
import { users, exams, questions, attempts, answers } from '../db/schema';
import { eq, and, sql, lt, gt, desc, asc } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { AppError } from '../utils/errorHandler';
import { format } from 'date-fns';
import { exec, spawn } from 'child_process';
import { writeFileSync, unlinkSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { promisify } from 'util';

const execAsync = promisify(exec);

export const studentService = {
  async getDashboardStats(studentId: string) {
    const history = await this.getExamHistory(studentId);
    const available = await this.getAvailableExams(studentId);
    
    // Calculate stats
    const totalAttempts = history.length;
    const totalPossiblePoints = history.reduce((acc: number, curr: any) => acc + (curr.totalMarks || 0), 0);
    const avgAccuracy = totalPossiblePoints > 0 
      ? Math.round((history.reduce((acc: number, curr: any) => acc + (curr.score || 0), 0) / totalPossiblePoints) * 100) 
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

    const upcomingExams = available.filter((e: any) => !e.isAttempted);
    console.log(`[Dashboard Sync] Sending ${upcomingExams.length} exams to student ${studentId}`);

    // Calculate Streak
    const activityDays = new Set(history.map((h: any) => h.submittedAt ? new Date(h.submittedAt).toDateString() : null).filter(Boolean));
    const streakDays = activityDays.size; // Simple unique days count for now

    return {
      upcomingExams,
      recentResults: history.slice(0, 5),
      performanceHistory,
      topicAnalysis: topics,
      globalLeaderboard,
      badges,
      stats: {
        totalAttempts,
        avgScore: avgAccuracy,
        totalTimeSpent: history.reduce((acc: number, curr: any) => acc + (curr.duration || 0), 0),
        currentRank: currentRank > 0 ? `#${currentRank}` : 'N/A',
        totalStudents,
        percentile,
        rankTrend: 'up',
        activeMissions: available.filter((e: any) => !e.isAttempted).length,
        streakDays
      },
      notifications: [
        { id: 1, type: 'exam', message: 'New Coding Quest: Python Data Structures is now live!', date: new Date() },
        { id: 2, type: 'rank', message: 'You moved up 3 spots in the global leaderboard!', date: new Date() }
      ]
    };
  },

  async getAvailableExams(studentId: string) {
    const now = new Date();
    const allExams = await db.select().from(exams);

    const studentAttempts = await db.select().from(attempts).where(eq(attempts.studentId, studentId));

    // Filter out exams that have been SUBMITTED by THIS student.
    // We KEEP ongoing exams so the student can resume them from the dashboard.
    return allExams
      .filter(exam => {
        const studentExamAttempts = studentAttempts.filter(a => a.examId === exam.id);
        const hasSubmitted = studentExamAttempts.some(a => a.status === 'submitted');
        return !hasSubmitted;
      })
      .map((exam: any) => {
        const studentExamAttempts = studentAttempts.filter(a => a.examId === exam.id);
        const ongoingAttempt = studentExamAttempts.find(a => a.status === 'ongoing');
        
        return {
          ...exam,
          isAttempted: studentExamAttempts.length > 0,
          status: ongoingAttempt ? 'Ongoing' : 'Available',
          attemptStatus: ongoingAttempt ? 'ongoing' : 'none'
        };
      });
  },

  async getLeaderboardExams(studentId: string) {
    try {
      console.log(`[Leaderboard] Fetching exams for student: ${studentId}`);
      
      const now = new Date();
      
      // Get all exams that the student has participated in
      const studentAttempts = await db.select({ examId: attempts.examId }).from(attempts).where(eq(attempts.studentId, studentId));
      const attemptedExamIds = new Set(studentAttempts.map(a => a.examId).filter(Boolean));
      
      console.log(`[Leaderboard] Student attempted ${attemptedExamIds.size} exams`);

      const allExams = await db.select().from(exams);
      console.log(`[Leaderboard] Total exams in DB: ${allExams.length}`);
      
      const filtered = allExams.filter(exam => {
        const isAttempted = attemptedExamIds.has(exam.id);
        const isActive = exam.endTime && new Date(exam.endTime) > now;
        return isAttempted || isActive;
      });

      console.log(`[Leaderboard] Returning ${filtered.length} relevant exams`);
      return filtered;
    } catch (error: any) {
      console.error('[Leaderboard Error Details]:', error.message, error.stack);
      throw error;
    }
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
      const savedAnswers = await db.select().from(answers).where(eq(answers.attemptId, existingAttempt.id));
      const formattedAnswers: Record<string, any> = {};
      savedAnswers.forEach(a => {
        try {
          const parsed = JSON.parse(a.content!);
          // If it's a coding answer, we only want the code for the local state
          formattedAnswers[a.questionId!] = (typeof parsed === 'object' && parsed !== null && 'code' in parsed) 
            ? parsed.code 
            : parsed;
        } catch (e) {
          formattedAnswers[a.questionId!] = a.content;
        }
      });

      return { 
        attemptId: existingAttempt.id, 
        startTime: existingAttempt.startTime,
        answers: formattedAnswers,
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
        // Real code execution grading
        try {
          const parsed = JSON.parse(studentValue);
          const code = parsed.code || studentValue;
          const lang = parsed.language || 'python';
          
          const result = await this.runCode(code, lang);
          
          if (result.success) {
            // Check if ANY of the correct answers (expected outputs) are present in the actual output
            isCorrect = correctOnes.some((expected: string) => 
              result.output.trim().toLowerCase().includes(expected.trim().toLowerCase())
            );
          } else {
            isCorrect = false;
          }
        } catch (e) {
          // Fallback to basic string check if JSON parsing fails (backwards compatibility)
          isCorrect = correctOnes.some((c: string) => studentValue?.includes(c.trim()));
        }
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

    console.log(`[Database Update] Attempt ${attemptId} finalized with score ${totalScore}`);

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
      .where(and(eq(attempts.examId, examId), eq(attempts.status, 'submitted')));

    const sorted = results.sort((a, b) => {
      const scoreA = a.score || 0;
      const scoreB = b.score || 0;
      if (scoreB !== scoreA) return scoreB - scoreA;
      
      const timeA = (a.endTime?.getTime() || 0) - (a.startTime?.getTime() || 0);
      const timeB = (b.endTime?.getTime() || 0) - (b.startTime?.getTime() || 0);
      if (timeA !== timeB) return timeA - timeB;
      
      return (a.endTime?.getTime() || 0) - (b.endTime?.getTime() || 0);
    });

    return sorted.map((entry, index) => ({
      ...entry,
      rank: index + 1
    }));
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
        startTime: attempts.startTime,
        endTime: attempts.endTime,
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
      
      const durationMs = h.endTime && h.startTime ? new Date(h.endTime).getTime() - new Date(h.startTime).getTime() : 0;
      const durationMin = Math.round(durationMs / 60000);

      return {
        ...h,
        duration: durationMin,
        totalMarks: totalMarks || 100,
        accuracy: totalMarks > 0 ? Math.round((h.score! / totalMarks) * 100) : 0
      };
    }));

    return formattedHistory;
  },

  async runCode(code: string, language: string, input: string = '') {
    const startTime = Date.now();
    const executionId = `exec_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const workDir = join(tmpdir(), executionId);
    
    let fileName = 'solution';
    let fileExt = '';
    let command = '';
    let args: string[] = [];
    let isCompiled = false;
    let compileCommand = '';
    let compileArgs: string[] = [];

    try {
      mkdirSync(workDir, { recursive: true });

      switch (language.trim().toLowerCase()) {
        case 'python':
          fileExt = '.py';
          command = 'python';
          args = ['-u']; // Unbuffered output
          break;
        case 'javascript':
          fileExt = '.js';
          command = 'node';
          break;
        case 'java':
          fileExt = '.java';
          const classNameMatch = code.match(/public\s+class\s+(\w+)/);
          fileName = classNameMatch ? classNameMatch[1] : 'Solution';
          compileCommand = 'javac';
          compileArgs = [fileName + '.java'];
          command = 'java';
          args = [fileName];
          isCompiled = true;
          break;
        default:
          return {
            success: false,
            error: `Execution environment for ${language} is not yet supported.`,
            output: '',
            executionTime: '0.000'
          };
      }

      const filePath = join(workDir, fileName + fileExt);
      writeFileSync(filePath, code);

      // Compilation step (for Java)
      if (isCompiled) {
        try {
          await new Promise((resolve, reject) => {
            const compileProcess = spawn(compileCommand, compileArgs, { cwd: workDir });
            let compileError = '';
            compileProcess.stderr.on('data', (data) => compileError += data.toString());
            compileProcess.on('close', (code) => {
              if (code === 0) resolve(true);
              else reject(new Error(compileError || `Compilation failed with code ${code}`));
            });
            // 10s timeout for compilation
            setTimeout(() => {
              compileProcess.kill();
              reject(new Error('Compilation timed out (10s)'));
            }, 10000);
          });
        } catch (err: any) {
          return {
            success: false,
            error: err.message,
            output: '',
            executionTime: '0.000'
          };
        }
      }

      // Execution step
      return new Promise((resolve) => {
        const fullArgs = isCompiled ? args : [...args, filePath];
        const process = spawn(command, fullArgs, { cwd: workDir });
        
        let output = '';
        let errorOutput = '';

        if (input) {
          process.stdin.write(input);
          process.stdin.end();
        }

        const timeout = setTimeout(() => {
          process.kill();
          resolve({
            success: false,
            error: 'Execution timed out (5s)',
            output: output,
            executionTime: '5.000'
          });
        }, 5000);

        process.stdout.on('data', (data) => output += data.toString());
        process.stderr.on('data', (data) => errorOutput += data.toString());

        process.on('close', (code) => {
          clearTimeout(timeout);
          const executionTime = ((Date.now() - startTime) / 1000).toFixed(3);
          
          if (code === 0) {
            resolve({ success: true, output, executionTime });
          } else {
            // Clean up error message (remove file paths)
            const cleanError = errorOutput.replace(new RegExp(workDir.replace(/\\/g, '\\\\'), 'g'), 'solution');
            resolve({
              success: false,
              error: cleanError || 'Execution failed with exit code ' + code,
              output: output,
              executionTime
            });
          }
        });

        process.on('error', (err) => {
          clearTimeout(timeout);
          resolve({
            success: false,
            error: `Failed to start execution: ${err.message}`,
            output: '',
            executionTime: '0.000'
          });
        });
      });

    } catch (err: any) {
      return {
        success: false,
        error: `Internal server error: ${err.message}`,
        output: '',
        executionTime: '0.000'
      };
    } finally {
      // Clean up async to not block
      setTimeout(() => {
        try { rmSync(workDir, { recursive: true, force: true }); } catch (e) {}
      }, 1000);
    }
  }
};
