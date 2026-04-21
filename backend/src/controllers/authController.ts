import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService.js';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = registerSchema.parse(req.body);
      const result = await authService.register(validated);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = loginSchema.parse(req.body);
      const result = await authService.login(validated);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async updateProfile(req: any, res: Response, next: NextFunction) {
    try {
      const result = await authService.updateProfile(req.user.id, req.body);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
};
