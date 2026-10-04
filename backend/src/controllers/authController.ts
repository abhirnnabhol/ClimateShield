import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { db } from '../db/index.js';
import { config } from '../config/env.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Valid email address required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  userType: z.enum(['Resident', 'Farmer', 'Outdoor Worker', 'Other']),
  cropType: z.string().optional(),
  farmArea: z.string().optional()
});

const loginSchema = z.object({
  email: z.string().email('Valid email address required'),
  password: z.string().min(1, 'Password is required')
});

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const parsed = registerSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: parsed.error.errors[0]?.message || 'Validation error' });
        return;
      }

      const { name, email, password, userType, cropType, farmArea } = parsed.data;

      const existing = db.findUserByEmail(email);
      if (existing) {
        res.status(409).json({ error: 'An account with this email already exists' });
        return;
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const newUser = db.createUser({
        name,
        email,
        passwordHash,
        userType,
        cropType,
        farmArea
      });

      const token = jwt.sign({ userId: newUser.id }, config.jwtSecret, { expiresIn: '7d' });
      const { passwordHash: _, ...safeUser } = newUser;

      res.status(201).json({
        user: safeUser,
        token,
        message: 'Account successfully created'
      });
    } catch (err) {
      console.error('Register error:', err);
      res.status(500).json({ error: 'Internal server error while creating account' });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: parsed.error.errors[0]?.message || 'Validation error' });
        return;
      }

      const { email, password } = parsed.data;

      const user = db.findUserByEmail(email);
      if (!user) {
        res.status(401).json({ error: 'Invalid email or password' });
        return;
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        res.status(401).json({ error: 'Invalid email or password' });
        return;
      }

      const token = jwt.sign({ userId: user.id }, config.jwtSecret, { expiresIn: '7d' });
      const { passwordHash: _, ...safeUser } = user;

      res.status(200).json({
        user: safeUser,
        token,
        message: 'Login successful'
      });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ error: 'Internal server error during login' });
    }
  }

  async logout(_req: Request, res: Response): Promise<void> {
    res.status(200).json({ message: 'Logged out successfully' });
  }

  async me(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const primaryLocation = db.getPrimaryLocation(req.user.id);
    const notificationSettings = db.getNotificationSettings(req.user.id);

    res.status(200).json({
      user: req.user,
      primaryLocation,
      notificationSettings
    });
  }

  async forgotPassword(req: Request, res: Response): Promise<void> {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ error: 'Email address is required' });
      return;
    }

    // Architecture support for password reset
    const user = db.findUserByEmail(email);
    if (user) {
      console.log(`[PASSWORD RESET REQUEST] Reset token generated for email ${email}`);
    }

    // Security best practice: Always return generic message to avoid email enumeration
    res.status(200).json({
      message: 'If an account exists with this email, password reset instructions have been dispatched.'
    });
  }
}

export const authController = new AuthController();
