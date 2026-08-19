import { Router } from 'express';
import { validateBody } from '../../shared/validate.js';
import { registerSchema, loginSchema, refreshSchema, logoutSchema, verifyEmailSchema, resendVerificationSchema } from './auth.schema.js';
import { register, login, refresh, logout, verifyEmail, resendVerification } from './auth.service.js';

export const authRouter = Router();

authRouter.post('/register', async (req, res) => {
  const body = validateBody(registerSchema, req.body);
  const user = await register(body);
  res.status(201).json(user);
});

authRouter.post('/login', async (req, res) => {
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

authRouter.post('/verify-email', async (req, res) => {
  const body = validateBody(verifyEmailSchema, req.body);
  await verifyEmail(body.email, body.otp);
  res.status(200).json({ message: 'Email verified successfully' });
});

authRouter.post('/resend-verification', async (req, res) => {
  const body = validateBody(resendVerificationSchema, req.body);
  await resendVerification(body.email);
  res.status(200).json({ message: 'If that email is pending verification, a new code has been sent' });
});
