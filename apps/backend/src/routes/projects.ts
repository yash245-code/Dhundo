import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { UserRole } from '@prisma/client';

export const projectsRouter = Router();
projectsRouter.use(authenticate);

const projectSchema = z.object({
  name: z.string().min(2).max(100).trim(),
  description: z.string().min(5).max(2000).trim(),
  repoUrl: z.string().url().optional().or(z.literal('')),
});

// GET /projects
projectsRouter.get('/', async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { bugs: true } } },
    });
    res.json({ success: true, data: projects });
  } catch (err) { next(err); }
});

// GET /projects/:id
projectsRouter.get('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: { _count: { select: { bugs: true } } },
    });
    if (!project) throw new AppError('Project not found.', 404);
    res.json({ success: true, data: project });
  } catch (err) { next(err); }
});

// POST /projects — Admin only
projectsRouter.post(
  '/',
  requireRole(UserRole.ADMIN),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const body = projectSchema.parse(req.body);
      const project = await prisma.project.create({ data: body });
      res.status(201).json({ success: true, data: project });
    } catch (err) { next(err); }
  },
);

// PUT /projects/:id — Admin only
projectsRouter.put(
  '/:id',
  requireRole(UserRole.ADMIN),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const body = projectSchema.partial().parse(req.body);
      const project = await prisma.project.update({
        where: { id: req.params.id },
        data: body,
      });
      res.json({ success: true, data: project });
    } catch (err) { next(err); }
  },
);

// DELETE /projects/:id — Admin only
projectsRouter.delete(
  '/:id',
  requireRole(UserRole.ADMIN),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      await prisma.project.delete({ where: { id: req.params.id } });
      res.json({ success: true, message: 'Project deleted.' });
    } catch (err) { next(err); }
  },
);
