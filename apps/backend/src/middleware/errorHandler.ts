import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  console.error('[ErrorHandler]', err);

  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json({ success: false, message: 'Invalid JSON body.' });
    return;
  }

  const status = (err as { status?: number }).status ?? 500;
  const message =
    process.env.NODE_ENV === 'production'
      ? status === 500
        ? 'Internal server error.'
        : (err as { message?: string }).message
      : (err as { message?: string }).message ?? 'Internal server error.';

  res.status(status).json({ success: false, message });
}

export class AppError extends Error {
  constructor(
    public readonly message: string,
    public readonly status: number = 500,
  ) {
    super(message);
    this.name = 'AppError';
  }
}
