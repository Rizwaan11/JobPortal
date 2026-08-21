import crypto from "node:crypto";
import { User } from "./user.model.js";
import { RefreshToken } from "./refresh-token.model.js";
import { EmailVerification } from "./email-verification.model.js";
import { Invitation } from "../companies/invitation.model.js";

export const findUserByEmail = async (email: string) => {
    const user = await User.findOne({ email: email }).select('+password');
    return user;
}

export const findUserById = async (id: string) => {
    const user = await User.findById(id);
    return user;
}

export const createUser = async (email: string, password: string, role:'recruiter'|'applicant'):Promise<{ id: string; email: string; role: 'recruiter' | 'applicant' }> => {
    const user = await User.create({ email, password, role ,status:'unverified'});
    return {
        id:user._id.toString(),
        email:user.email,
        role,
    }
}

export const createRefreshToken = async (userId: string, tokenHash: string, expiresAt: Date) => {
    await RefreshToken.create({ userId, tokenHash, expiresAt });
}

export const findRefreshTokenByHash = async (tokenHash: string) => {
    const token = await RefreshToken.findOne({ tokenHash, expiresAt: { $gt: new Date() } });
    return token;
}

export const deleteRefreshTokenByHash = async (tokenHash: string) => {
    await RefreshToken.deleteOne({ tokenHash });
}

export const deleteAllRefreshTokensForUser = async (userId: string) => {
    await RefreshToken.deleteMany({ userId });
}

export const createEmailVerification = async (userId: string, otpHash: string, expiresAt: Date) => {
    await EmailVerification.deleteMany({ userId });
    await EmailVerification.create({ userId, otpHash, expiresAt });
}

export const findEmailVerification = async (userId: string) => {
    const verification = await EmailVerification.findOne({ userId, expiresAt: { $gt: new Date() } });
    return verification;
}

export const deleteEmailVerificationsForUser = async (userId: string) => {
    await EmailVerification.deleteMany({ userId });
}

export const activateUser = async (userId: string) => {
    await User.findByIdAndUpdate(userId, { status: 'active' });
}

export const findInvitationByToken = async (rawToken: string) => {
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const invitation = await Invitation.findOne({ tokenHash, expiresAt: { $gt: new Date() } });
    return invitation;
}

export const deleteInvitation = async (invitationId: string) => {
    await Invitation.findByIdAndDelete(invitationId);
}
