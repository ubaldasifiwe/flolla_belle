import jwt from 'jsonwebtoken';

const COOKIE_NAME = 'florabelle_admin';

function getSecret() {
  const s = process.env.JWT_SECRET;
  if (!s) {
    throw new Error('JWT_SECRET is not set');
  }
  return s;
}

/**
 * Express middleware: requires valid JWT (cookie or Authorization: Bearer).
 */
export function requireAdmin(req, res, next) {
  try {
    getSecret();
  } catch {
    console.error('Auth misconfiguration: JWT_SECRET missing');
    return res.status(500).json({ message: 'Server auth not configured' });
  }

  const header = req.headers.authorization;
  const bearer = header?.startsWith('Bearer ') ? header.slice(7) : null;
  const token = req.cookies?.[COOKIE_NAME] || bearer;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    req.admin = { id: payload.sub, email: payload.email };
    next();
  } catch {
    return res.status(401).json({ message: 'Unauthorized' });
  }
}

export { COOKIE_NAME };
