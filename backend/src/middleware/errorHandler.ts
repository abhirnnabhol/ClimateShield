import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction): void {
  console.error('[Global Error Handler]:', err);
  const status = err.status || 500;
  const message = err.message || 'An unexpected internal server error occurred';
  res.status(status).json({
    error: message,
    timestamp: new Date().toISOString()
  });
}
