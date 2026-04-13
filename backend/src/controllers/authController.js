import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { findAdminByEmail } from '../models/adminUserModel.js';
import { COOKIE_NAME } from '../middleware/authMiddleware.js';

function getJwtSecret() {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error('JWT_SECRET is not set');
  return s;
}

const TOKEN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function signAdminToken(admin) {
  return jwt.sign(
    { sub: admin.id, email: admin.email, role: 'admin' },
    getJwtSecret(),
    { expiresIn: '7d' }
  );
}

function cookieOptions() {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'lax' : 'lax',
    maxAge: TOKEN_MAX_AGE_MS,
    path: '/',
  };
}

export async function loginHandler(req, res) {
  try {
    getJwtSecret();
  } catch {
    console.error('JWT_SECRET missing');
    return res.status(500).json({ message: 'Server auth not configured' });
  }

  const { email, password } = req.body || {};
  const em = String(email || '').trim().toLowerCase();
  const pw = String(password || '');

  if (!em || !pw) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const admin = await findAdminByEmail(em);
    if (!admin) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const ok = await bcrypt.compare(pw, admin.password_hash);
    if (!ok) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = signAdminToken(admin);
    res.cookie(COOKIE_NAME, token, cookieOptions());

    return res.json({
      ok: true,
      user: { email: admin.email, role: 'admin' },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Login failed' });
  }
}

export async function logoutHandler(req, res) {
  res.clearCookie(COOKIE_NAME, { path: '/' });
  res.json({ ok: true });
}

export async function meHandler(req, res) {
  try {
    getJwtSecret();
  } catch {
    return res.status(500).json({ message: 'Server auth not configured' });
  }

  const header = req.headers.authorization;
  const bearer = header?.startsWith('Bearer ') ? header.slice(7) : null;
  const token = req.cookies?.[COOKIE_NAME] || bearer;

  if (!token) {
    return res.status(200).json({ authenticated: false });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.role !== 'admin') {
      return res.status(200).json({ authenticated: false });
    }
    return res.json({
      authenticated: true,
      user: { email: payload.email, role: 'admin' },
    });
  } catch {
    return res.status(200).json({ authenticated: false });
  }
}
