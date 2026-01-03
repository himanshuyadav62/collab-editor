import { Request, Response, NextFunction } from 'express';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

/**
 * Auth middleware that extracts user ID from Authorization header.
 * The frontend sends the Supabase user ID in the header after Google login.
 * Format: "Bearer <user_id>"
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  const userId = authHeader.substring(7); // Remove "Bearer " prefix

  if (!userId) {
    return res.status(401).json({ error: 'Invalid user ID' });
  }

  req.userId = userId;
  next();
}
