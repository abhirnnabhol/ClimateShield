import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { db } from '../db/index.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  userType: z.enum(['Resident', 'Farmer', 'Outdoor Worker', 'Other']).optional(),
  cropType: z.string().optional(),
  farmArea: z.string().optional()
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters')
});

const notificationSettingsSchema = z.object({
  heatAlerts: z.boolean().optional(),
  droughtAlerts: z.boolean().optional(),
  floodAlerts: z.boolean().optional(),
  minimumSeverity: z.enum(['LOW', 'MODERATE', 'HIGH', 'EXTREME']).optional(),
  channels: z
    .object({
      inApp: z.boolean().optional(),
      email: z.boolean().optional(),
      sms: z.boolean().optional()
    })
    .optional()
});

export class ProfileController {
  async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const primaryLocation = db.getPrimaryLocation(req.user.id);
      const notificationSettings = db.getNotificationSettings(req.user.id);

      res.status(200).json({
        user: req.user,
        primaryLocation,
        notificationSettings
      });
    } catch (err) {
      res.status(500).json({ error: 'Failed to get profile' });
    }
  }

  async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const parsed = updateProfileSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: parsed.error.errors[0]?.message || 'Invalid profile updates' });
        return;
      }

      const updated = db.updateUser(req.user.id, parsed.data);
      if (!updated) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      const { passwordHash: _, ...safeUser } = updated;
      res.status(200).json({ user: safeUser, message: 'Profile updated successfully' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to update profile' });
    }
  }

  async changePassword(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const parsed = changePasswordSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: parsed.error.errors[0]?.message || 'Invalid password parameters' });
        return;
      }

      const fullUser = db.findUserById(req.user.id);
      if (!fullUser) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      const isMatch = await bcrypt.compare(parsed.data.currentPassword, fullUser.passwordHash);
      if (!isMatch) {
        res.status(400).json({ error: 'Current password is incorrect' });
        return;
      }

      const salt = await bcrypt.genSalt(10);
      const newHash = await bcrypt.hash(parsed.data.newPassword, salt);
      db.updateUser(req.user.id, { passwordHash: newHash });

      res.status(200).json({ message: 'Password changed successfully' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to change password' });
    }
  }

  async getNotificationSettings(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const settings = db.getNotificationSettings(req.user.id);
      res.status(200).json({ settings });
    } catch (err) {
      res.status(500).json({ error: 'Failed to get notification settings' });
    }
  }

  async updateNotificationSettings(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const parsed = notificationSettingsSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: parsed.error.errors[0]?.message || 'Invalid settings' });
        return;
      }

      const updated = db.updateNotificationSettings(req.user.id, parsed.data as any);
      res.status(200).json({ settings: updated, message: 'Notification settings updated' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to update notification settings' });
    }
  }
}

export const profileController = new ProfileController();
