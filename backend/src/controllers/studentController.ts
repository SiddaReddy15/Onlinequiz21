import { Response, NextFunction } from 'express';
import { studentService } from '../services/studentService';
import { AuthRequest } from '../middleware/auth';

export const studentController = {
  async getDashboard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const stats = await studentService.getDashboardStats(req.user!.id);
      res.status(200).json(stats);
    } catch (error) {
      next(error);
    }
  },

  async getAvailableExams(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const exams = await studentService.getAvailableExams(req.user!.id);
      res.status(200).json(exams);
    } catch (error) {
      next(error);
    }
  },

  async getLeaderboardExams(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const exams = await studentService.getLeaderboardExams(req.user!.id);
      res.status(200).json(exams);
    } catch (error) {
      next(error);
    }
  },

  async startAttempt(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { examId } = req.body;
      const result = await studentService.startAttempt(req.user!.id, examId);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  async autoSaveAnswer(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { attemptId, questionId, content } = req.body;
      await studentService.saveAnswer(attemptId, questionId, content);
      res.status(200).json({ message: 'Answer saved' });
    } catch (error) {
      next(error);
    }
  },

  async runCode(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { code, language, input } = req.body;
      const result = await studentService.runCode(code, language, input);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async submitAttempt(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { attemptId } = req.body;
      const result = await studentService.submitAttempt(attemptId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async getAttemptResult(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const examId = req.params.examId as string;
      const result = await studentService.getAttemptResult(req.user!.id, examId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async getExamHistory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const history = await studentService.getExamHistory(req.user!.id);
      res.status(200).json(history);
    } catch (error) {
      next(error);
    }
  },

  async getLeaderboard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const examId = req.params.examId as string;
      const leaderboard = await studentService.getLeaderboard(examId);
      res.status(200).json(leaderboard);
    } catch (error) {
      next(error);
    }
  },
};
