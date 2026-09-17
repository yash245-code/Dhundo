import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import { UserRole } from '@prisma/client';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';

export const usersRouter = Router();
usersRouter.use(authenticate);

// GET /users — Admin only
usersRouter.get(
  '/',
  requireRole(UserRole.ADMIN),
  async (_req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const users = await prisma.user.findMany({
        select: { id: true, name: true, officeId: true, email: true, role: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      });
      res.json({ success: true, data: users });
    } catch (err) { next(err); }
  },
);

// GET /users/:id
usersRouter.get('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: { id: true, name: true, officeId: true, email: true, role: true, createdAt: true },
    });
    if (!user) throw new AppError('User not found.', 404);
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
});

// PATCH /users/:id/role — Admin only
usersRouter.patch(
  '/:id/role',
  requireRole(UserRole.ADMIN),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { role } = z.object({ role: z.nativeEnum(UserRole) }).parse(req.body);
      const user = await prisma.user.update({
        where: { id: req.params.id },
        data: { role },
        select: { id: true, name: true, officeId: true, email: true, role: true },
      });
      res.json({ success: true, data: user });
    } catch (err) { next(err); }
  },
);

// POST /users/office-ids — Admin: add new office IDs to whitelist
usersRouter.post(
  '/office-ids',
  requireRole(UserRole.ADMIN),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { officeIds } = z.object({ officeIds: z.array(z.string().trim().toUpperCase()).min(1) }).parse(req.body);
      const created = await prisma.officeId.createMany({
        data: officeIds.map((id) => ({ officeId: id })),
        skipDuplicates: true,
      });
      res.status(201).json({ success: true, data: { created: created.count } });
    } catch (err) { next(err); }
  },
);

// GET /users/office-ids — Admin: list all office IDs
usersRouter.get(
  '/office-ids',
  requireRole(UserRole.ADMIN),
  async (_req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const ids = await prisma.officeId.findMany({ orderBy: { createdAt: 'desc' } });
      res.json({ success: true, data: ids });
    } catch (err) { next(err); }
  },
);
