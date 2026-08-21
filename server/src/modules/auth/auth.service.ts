import crypto from 'node:crypto';
import { hashPassword, verifyPassword } from '../../shared/password.js';
import { ConflictError, UnauthorizedError, BadRequestError, ForbiddenError } from '../../shared/errors.js';
import { config } from '../../shared/config.js';
import { generateOtp, hashOtp } from '../../shared/otp.js';
import { sendVerificationEmail } from '../../shared/mailer.js';
import {
  findUserByEmail,
  createUser,
  findUserById,
  createRefreshToken,
  findRefreshTokenByHash,
  deleteRefreshTokenByHash,
  createEmailVerification,
  findEmailVerification,
  deleteEmailVerificationsForUser,
  activateUser,
  findInvitationByToken,
  deleteInvitation,
} from './auth.repo.js';
import { createRecruiter } from '../companies/companies.repo.js';
import type { RegisterInput, LoginInput, AcceptInvitationInput } from './auth.schema.js';
import { signAccessToken } from '../../shared/token.js';

// Used in the login path when no user is found, so the timing cost of
// bcrypt.compare is paid the same whether the email exists or not.
// Generated with: node -e "require('bcryptjs').hash('__dummy__',12).then(console.log)"
const DUMMY_HASH = '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36zLklGLsR9XFKQZ5kQlbri';



export async function register( input: RegisterInput):
                     Promise<{ id: string; email: string; role: 'recruiter' | 'applicant' }> {

  const existing = await findUserByEmail(input.email);
  if (existing) {
    throw new ConflictError('Email already taken');
  }

  const passwordHash = await hashPassword(input.password);
  const user = await createUser(input.email, passwordHash, input.role);

  const otp = generateOtp();
  const otpHash = hashOtp(otp);
  const expiresAt = new Date(Date.now() + config.OTP_EXPIRES_IN_MINUTES * 60 * 1000);

  await createEmailVerification(user.id, otpHash, expiresAt);
  await sendVerificationEmail(input.email, otp);

  return user;
}

async function issueTokenPair(userId: string, role: 'admin' | 'recruiter' | 'applicant'): Promise<{ accessToken: string; refreshToken: string }> {
  const rawRefreshToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawRefreshToken).digest('hex');
  const expiresAt = new Date(Date.now() + config.REFRESH_TOKEN_EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000);

  await createRefreshToken(userId, tokenHash, expiresAt);

  const accessToken = signAccessToken({ sub: userId, role });

  return { accessToken, refreshToken: rawRefreshToken };
}

export async function login(
  input: LoginInput,
): Promise<{ id: string; email: string; role: 'recruiter' | 'applicant' | 'admin'; accessToken: string; refreshToken: string }> {
  const user = await findUserByEmail(input.email);

  if (!user) {
    await verifyPassword(input.password, DUMMY_HASH);
    throw new UnauthorizedError('Invalid credentials');
  }

  if (user.status === 'suspended') throw new UnauthorizedError('Account suspended');
  if (user.status === 'unverified') throw new UnauthorizedError('Please verify your email before logging in');

  const valid = await verifyPassword(input.password, user.password);
  if (!valid) {
    throw new UnauthorizedError('Invalid credentials');
  }

  const { accessToken, refreshToken } = await issueTokenPair(user._id.toString(), user.role);

  return {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
    accessToken,
    refreshToken,
  };
}

export async function refresh(rawToken: string): Promise<{ accessToken: string; refreshToken: string }> {
  const hash = crypto.createHash('sha256').update(rawToken).digest('hex');

  const tokenRow = await findRefreshTokenByHash(hash);
  if (!tokenRow) {
    throw new UnauthorizedError('Invalid or expired refresh token');
  }

  const user = await findUserById(tokenRow.userId.toString());
  if (!user || user.status !== 'active') {
    throw new UnauthorizedError('Invalid or expired refresh token');
  }

  await deleteRefreshTokenByHash(hash);

  return issueTokenPair(user._id.toString(), user.role);
}

export async function logout(rawToken: string): Promise<void> {
  const hash = crypto.createHash('sha256').update(rawToken).digest('hex');
  await deleteRefreshTokenByHash(hash);
}

export async function verifyEmail(email: string, otp: string): Promise<void> {
  const user = await findUserByEmail(email);
  if (!user) {
    throw new UnauthorizedError('Invalid verification code');
  }

  if (user.status === 'active') {
    return;
  }

  const verification = await findEmailVerification(user._id.toString());
  if (!verification) {
    throw new UnauthorizedError('Invalid verification code');
  }

  const submittedHash = hashOtp(otp);
  if (submittedHash !== verification.otpHash) {
    throw new UnauthorizedError('Invalid verification code');
  }

  await activateUser(user._id.toString());
  await deleteEmailVerificationsForUser(user._id.toString());
}

export async function resendVerification(email: string): Promise<void> {
  const user = await findUserByEmail(email);

  if (!user) {
    return;
  }

  if (user.status === 'active') {
    return;
  }

  if (user.status !== 'unverified') {
    return;
  }

  const otp = generateOtp();
  const otpHash = hashOtp(otp);
  const expiresAt = new Date(Date.now() + config.OTP_EXPIRES_IN_MINUTES * 60 * 1000);

  await createEmailVerification(user._id.toString(), otpHash, expiresAt);
  await sendVerificationEmail(email, otp);
}

export async function acceptInvitation(input: AcceptInvitationInput): Promise<{ accessToken: string; refreshToken: string }> {
  const invitation = await findInvitationByToken(input.token);
  if (!invitation) {
    throw new BadRequestError('Invalid or expired invitation token.');
  }

  if (invitation.email.toLowerCase() !== input.email.toLowerCase()) {
    throw new BadRequestError('Invalid or expired invitation token.');
  }

  const user = await findUserByEmail(input.email);
  if (!user) {
    throw new BadRequestError('No account found for this email. Please register first.');
  }

  if (user.status !== 'active') {
    throw new ForbiddenError('Your account is not active.');
  }

  await createRecruiter(user._id.toString(), invitation.companyId.toString(), invitation.role);
  await deleteInvitation(invitation._id.toString());

  return issueTokenPair(user._id.toString(), user.role);
}
