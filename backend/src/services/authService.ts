import { db } from '../db/index';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { AppError } from '../utils/errorHandler';

export const authService = {
  async register(data: any) {
    const existing = await db.query.users.findFirst({
      where: eq(users.email, data.email),
    });

    if (existing) {
      throw new AppError('User already exists', 400);
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const id = uuidv4();

    await db.insert(users).values({
      id,
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: 'student',
    });

    return { message: 'Registration successful' };
  },

  async login(data: any) {
    const user = await db.query.users.findFirst({
      where: eq(users.email, data.email),
    });

    if (!user || !(await bcrypt.compare(data.password, user.password))) {
      throw new AppError('Invalid credentials', 401);
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '1d' }
    );

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  },

  async updateProfile(userId: string, data: any) {
    const user = await db.select().from(users).where(eq(users.id, userId)).get();
    if (!user) throw new AppError('User not found', 404);

    if (data.currentPassword) {
      const isMatch = await bcrypt.compare(data.currentPassword, user.password);
      if (!isMatch) throw new AppError('Incorrect current password', 401);
    } else if (data.newPassword) {
      throw new AppError('Current password is required to set a new password', 400);
    }

    const updates: any = {};
    if (data.name) updates.name = data.name;
    if (data.newPassword) {
      updates.password = await bcrypt.hash(data.newPassword, 10);
    }
    updates.updatedAt = new Date();

    await db.update(users).set(updates).where(eq(users.id, userId));
    
    return { 
      message: 'Profile updated successfully',
      user: { id: userId, name: data.name || user.name, email: user.email, role: user.role }
    };
  },
};
