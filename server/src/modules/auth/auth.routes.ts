import { Router } from 'express';
import { validateBody } from '../../shared/validate.js';
import { registerSchema, loginSchema, refreshSchema, logoutSchema } from './auth.schema.js';
import { register, login, refresh, logout } from './auth.service.js';

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
