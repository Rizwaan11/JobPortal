import { Router } from 'express';
import { validateBody } from '../../shared/validate.js';
import { authMiddleware } from '../../shared/auth-middleware.js';
import { registerSchema, loginSchema, refreshSchema, logoutSchema, verifyEmailSchema, resendVerificationSchema, acceptInvitationSchema } from './auth.schema.js';
import { register, login, refresh, logout, verifyEmail, resendVerification, acceptInvitation, getCurrentUser } from './auth.service.js';
import { authLimiter } from '../../shared/rate-limiter.js';

export const authRouter = Router();

authRouter.post('/register', authLimiter, async (req, res) => {
  const body = validateBody(registerSchema, req.body);
  const user = await register(body);
  res.status(201).json(user);
});

authRouter.post('/login', authLimiter, async (req, res) => {
  const body = validateBody(loginSchema, req.body);
  const user = await login(body);
  res.status(200).json(user);
});

authRouter.post('/refresh', async (req, res) => {
  const body = validateBody(refreshSchema, req.body);
  const tokens = await refresh(body.refreshToken);
  res.status(200).json(tokens);
});

authRouter.post('/logout', async (req, res) => {
  const body = validateBody(logoutSchema, req.body);
  await logout(body.refreshToken);
  res.status(204).send();
});

authRouter.get('/me', authMiddleware, async (req, res) => {
  const user = await getCurrentUser(req.user!.userId);
  res.json({ user });
});

authRouter.post('/verify-email', authLimiter, async (req, res) => {
  const body = validateBody(verifyEmailSchema, req.body);
  await verifyEmail(body.email, body.otp);
  res.status(200).json({ message: 'Email verified successfully' });
});

authRouter.post('/resend-verification', authLimiter, async (req, res) => {
  const body = validateBody(resendVerificationSchema, req.body);
  await resendVerification(body.email);
  res.status(200).json({ message: 'If that email is pending verification, a new code has been sent' });
});

authRouter.post('/accept-invitation', async (req, res) => {
  const body = validateBody(acceptInvitationSchema, req.body);
  const tokens = await acceptInvitation(body);
  res.status(200).json(tokens);
});
