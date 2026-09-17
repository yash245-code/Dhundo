import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

export const authRouter = Router();

// ─── Schemas ─────────────────────────────────────────────────────────────────

const registerSchema = z.object({
  name: z.string().min(2).max(100).trim(),
  officeId: z.string().min(3).max(20).trim().toUpperCase(),
  email: z.string().email().trim().toLowerCase(),
  password: z.string().min(8).max(72),
});

const loginSchema = z.object({
  officeId: z.string().trim().toUpperCase(),
  password: z.string(),
});

const refreshSchema = z.object({
  refreshToken: z.string(),
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function signTokens(userId: string, role: string) {
  const accessToken = jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET!,
    { expiresIn: process.env.JWT_EXPIRES_IN ?? '15m' } as jwt.SignOptions,
  );
  const refreshToken = jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '30d' } as jwt.SignOptions,
  );
  return { accessToken, refreshToken };
}

// ─── POST /auth/register ──────────────────────────────────────────────────────

authRouter.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = registerSchema.parse(req.body);

    // Check office ID exists in whitelist
    const officeIdRecord = await prisma.officeId.findUnique({
      where: { officeId: body.officeId },
    });
    if (!officeIdRecord) {
      throw new AppError('Office ID not found in the approved list.', 400);
    }
    if (officeIdRecord.usedAt) {
      throw new AppError('This office ID is already registered.', 409);
    }

    // Check email not taken
    const existing = await prisma.user.findUnique({ where: { email: body.email } });
    if (existing) {
      throw new AppError('An account with this email already exists.', 409);
    }

    const passwordHash = await bcrypt.hash(body.password, 12);
    const user = await prisma.user.create({
      data: {
        name: body.name,
        officeId: body.officeId,
        email: body.email,
        passwordHash,
      },
    });

    // Mark office ID as used
    await prisma.officeId.update({
      where: { officeId: body.officeId },
      data: { usedAt: new Date() },
    });

    const tokens = signTokens(user.id, user.role);
    res.status(201).json({
      success: true,
      data: {
        user: { id: user.id, name: user.name, officeId: user.officeId, email: user.email, role: user.role },
        ...tokens,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ─── POST /auth/login ─────────────────────────────────────────────────────────

authRouter.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { officeId: body.officeId } });
    if (!user) {
      throw new AppError('Invalid office ID or password.', 401);
    }

    const valid = await bcrypt.compare(body.password, user.passwordHash);
    if (!valid) {
      throw new AppError('Invalid office ID or password.', 401);
    }

    const tokens = signTokens(user.id, user.role);
    res.json({
      success: true,
      data: {
        user: { id: user.id, name: user.name, officeId: user.officeId, email: user.email, role: user.role },
        ...tokens,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ─── POST /auth/refresh ───────────────────────────────────────────────────────

authRouter.post('/refresh', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = refreshSchema.parse(req.body);
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as { id: string };
    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user) {
      throw new AppError('User not found.', 401);
    }
    const accessToken = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN ?? '15m' } as jwt.SignOptions,
    );
    res.json({ success: true, data: { accessToken } });
  } catch {
    next(new AppError('Invalid or expired refresh token.', 401));
  }
});

// ─── GET /auth/me ─────────────────────────────────────────────────────────────

authRouter.get('/me', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, name: true, officeId: true, email: true, role: true, createdAt: true },
    });
    if (!user) throw new AppError('User not found.', 404);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
});

// ─── POST /auth/logout ────────────────────────────────────────────────────────

authRouter.post('/logout', authenticate, (_req: Request, res: Response) => {
  // Stateless JWT: client deletes token; add token blacklist here if needed
  res.json({ success: true, message: 'Logged out successfully.' });
});
