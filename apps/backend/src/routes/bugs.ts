import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import { BugSeverity, BugStatus, UserRole } from '@prisma/client';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';

export const bugsRouter = Router();
bugsRouter.use(authenticate);

// ─── Schemas ──────────────────────────────────────────────────────────────────

const createBugSchema = z.object({
  projectId: z.string().uuid(),
  title: z.string().min(5).max(200).trim(),
  description: z.string().min(10).max(5000).trim(),
  stepsToReproduce: z.string().max(5000).trim().optional(),
  severity: z.nativeEnum(BugSeverity).default(BugSeverity.MEDIUM),
  environment: z.string().max(200).trim().optional(),
});

const updateBugSchema = z.object({
  title: z.string().min(5).max(200).trim().optional(),
  description: z.string().min(10).max(5000).trim().optional(),
  stepsToReproduce: z.string().max(5000).trim().optional(),
  severity: z.nativeEnum(BugSeverity).optional(),
  status: z.nativeEnum(BugStatus).optional(),
  assigneeId: z.string().uuid().nullable().optional(),
  environment: z.string().max(200).trim().optional(),
});

const commentSchema = z.object({
  comment: z.string().min(1).max(2000).trim(),
});

const filterSchema = z.object({
  projectId: z.string().uuid().optional(),
  severity: z.nativeEnum(BugSeverity).optional(),
  status: z.nativeEnum(BugStatus).optional(),
  assigneeId: z.string().uuid().optional(),
  search: z.string().max(200).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// ─── GET /bugs ────────────────────────────────────────────────────────────────

bugsRouter.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { projectId, severity, status, assigneeId, search, page, limit } =
      filterSchema.parse(req.query);

    const where = {
      ...(projectId && { projectId }),
      ...(severity && { severity }),
      ...(status && { status }),
      ...(assigneeId && { assigneeId }),
      ...(search && {
        OR: [
          { title: { contains: search } },
          { description: { contains: search } },
        ],
      }),
    };

    const [bugs, total] = await Promise.all([
      prisma.bug.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          project: { select: { id: true, name: true } },
          reporter: { select: { id: true, name: true } },
          assignee: { select: { id: true, name: true } },
          _count: { select: { comments: true, attachments: true } },
        },
      }),
      prisma.bug.count({ where }),
    ]);

    res.json({
      success: true,
      data: bugs,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) { next(err); }
});

// ─── GET /bugs/:id ────────────────────────────────────────────────────────────

bugsRouter.get('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const bug = await prisma.bug.findUnique({
      where: { id: req.params.id },
      include: {
        project: { select: { id: true, name: true } },
        reporter: { select: { id: true, name: true, officeId: true } },
        assignee: { select: { id: true, name: true, officeId: true } },
        comments: {
          orderBy: { createdAt: 'asc' },
          include: { user: { select: { id: true, name: true } } },
        },
        attachments: { orderBy: { uploadedAt: 'desc' } },
      },
    });
    if (!bug) throw new AppError('Bug not found.', 404);
    res.json({ success: true, data: bug });
  } catch (err) { next(err); }
});

// ─── POST /bugs ───────────────────────────────────────────────────────────────

bugsRouter.post('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const body = createBugSchema.parse(req.body);

    // Verify project exists
    const project = await prisma.project.findUnique({ where: { id: body.projectId } });
    if (!project) throw new AppError('Project not found.', 404);

    const bug = await prisma.bug.create({
      data: { ...body, reporterId: req.user!.id },
      include: {
        project: { select: { id: true, name: true } },
        reporter: { select: { id: true, name: true } },
      },
    });

    res.status(201).json({ success: true, data: bug });
  } catch (err) { next(err); }
});

// ─── PUT /bugs/:id ────────────────────────────────────────────────────────────

bugsRouter.put('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const body = updateBugSchema.parse(req.body);
    const existing = await prisma.bug.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new AppError('Bug not found.', 404);

    // Only reporter, assignee, developer/QA, or admin can update
    const { role, id: userId } = req.user!;
    const canUpdate =
      [UserRole.ADMIN, UserRole.DEVELOPER, UserRole.QA].includes(role) ||
      existing.reporterId === userId ||
      existing.assigneeId === userId;

    if (!canUpdate) throw new AppError('You do not have permission to update this bug.', 403);

    const bug = await prisma.bug.update({
      where: { id: req.params.id },
      data: { ...body, updatedAt: new Date() },
      include: {
        project: { select: { id: true, name: true } },
        reporter: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true } },
      },
    });

    // Create notification if status changed or assignee changed
    if (body.status && body.status !== existing.status && existing.reporterId !== userId) {
      await prisma.notification.create({
        data: {
          userId: existing.reporterId,
          type: 'STATUS_CHANGED',
          title: 'Bug status updated',
          body: `"${existing.title}" is now ${body.status.replace('_', ' ')}`,
          bugId: existing.id,
        },
      });
    }

    if (body.assigneeId && body.assigneeId !== existing.assigneeId) {
      await prisma.notification.create({
        data: {
          userId: body.assigneeId,
          type: 'ASSIGNED',
          title: 'Bug assigned to you',
          body: `You've been assigned to: "${existing.title}"`,
          bugId: existing.id,
        },
      });
    }

    res.json({ success: true, data: bug });
  } catch (err) { next(err); }
});

// ─── DELETE /bugs/:id ─────────────────────────────────────────────────────────

bugsRouter.delete(
  '/:id',
  requireRole(UserRole.ADMIN),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      await prisma.bug.delete({ where: { id: req.params.id } });
      res.json({ success: true, message: 'Bug deleted.' });
    } catch (err) { next(err); }
  },
);

// ─── POST /bugs/:id/comments ──────────────────────────────────────────────────

bugsRouter.post('/:id/comments', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { comment } = commentSchema.parse(req.body);
    const bug = await prisma.bug.findUnique({ where: { id: req.params.id } });
    if (!bug) throw new AppError('Bug not found.', 404);

    const newComment = await prisma.bugComment.create({
      data: { bugId: req.params.id, userId: req.user!.id, comment },
      include: { user: { select: { id: true, name: true } } },
    });

    // Notify reporter and assignee (not the commenter)
    const notifyUsers = [bug.reporterId, bug.assigneeId].filter(
      (id) => id && id !== req.user!.id,
    ) as string[];

    if (notifyUsers.length > 0) {
      await prisma.notification.createMany({
        data: notifyUsers.map((userId) => ({
          userId,
          type: 'COMMENTED' as const,
          title: 'New comment on a bug',
          body: `A new comment was added to: "${bug.title}"`,
          bugId: bug.id,
        })),
      });
    }

    res.status(201).json({ success: true, data: newComment });
  } catch (err) { next(err); }
});

// ─── GET /bugs/:id/comments ───────────────────────────────────────────────────

bugsRouter.get('/:id/comments', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const comments = await prisma.bugComment.findMany({
      where: { bugId: req.params.id },
      orderBy: { createdAt: 'asc' },
      include: { user: { select: { id: true, name: true } } },
    });
    res.json({ success: true, data: comments });
  } catch (err) { next(err); }
});
