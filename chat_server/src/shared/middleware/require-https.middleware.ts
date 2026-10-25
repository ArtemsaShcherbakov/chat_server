import { NextFunction, Request, Response } from 'express';

// Rejects plain-HTTP requests so passwords never travel unencrypted.
// Behind a TLS-terminating proxy, enable TRUST_PROXY so req.secure reflects X-Forwarded-Proto.
export function requireHttps(req: Request, res: Response, next: NextFunction) {
  if (req.secure) {
    return next();
  }
  res.status(403).json({
    data: null,
    error: { statusCode: 403, message: 'HTTPS is required' },
  });
}
