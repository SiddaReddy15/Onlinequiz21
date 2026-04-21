import { Request, Response, NextFunction } from 'express';
import { adminService } from '../services/adminService.js';
import { AuthRequest } from '../middleware/auth.js';

export const adminController = {
  async getDashboardStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const stats = await adminService.getDashboardStats();
      res.status(200).json(stats);
    } catch (error) {
      next(error);
    }
  },

  async createExam(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const exam = await adminService.createExam({ ...req.body, createdBy: req.user?.id });
      res.status(201).json(exam);
    } catch (error) {
      next(error);
    }
  },

  async getAllExams(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const exams = await adminService.getAllExams();
      res.status(200).json(exams);
    } catch (error) {
      next(error);
    }
  },

  async addQuestions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { examId, questions } = req.body;
      const result = await adminService.addQuestions(examId, questions);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  async getResults(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const results = await adminService.getResults();
      res.status(200).json(results);
    } catch (error) {
      next(error);
    }
  },

  async updateExam(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const exam = await adminService.updateExam(id, req.body);
      res.status(200).json(exam);
    } catch (error) {
      next(error);
    }
  },

  async updateQuestions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { examId, questions } = req.body;
      const result = await adminService.updateQuestions(examId, questions);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async deleteExam(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await adminService.deleteExam(id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async getExamById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const exam = await adminService.getExamById(id);
      if (!exam) return res.status(404).json({ message: 'Exam not found' });
      res.status(200).json(exam);
    } catch (error) {
      next(error);
    }
  },

  async getAllStudents(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const students = await adminService.getAllStudents();
      res.status(200).json(students);
    } catch (error) {
      next(error);
    }
  },

  async createStudent(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const student = await adminService.createStudent(req.body);
      res.status(201).json(student);
    } catch (error) {
      next(error);
    }
  },

  async getAnalytics(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const analytics = await adminService.getAnalytics();
      res.status(200).json(analytics);
    } catch (error) {
      next(error);
    }
  },
};
