import { User } from "./user.model.js";
import { RefreshToken } from "./refresh-token.model.js";

export const findUserByEmail = async (email: string) => {
    const user = await User.findOne({ email: email }).select('+password');
    return user;
}

export const findUserById = async (id: string) => {
    const user = await User.findById(id);
    return user;
}

export const createUser = async (email: string, password: string, role:'recruiter'|'applicant'):Promise<{ id: string; email: string; role: 'recruiter' | 'applicant' }> => {
    const user = await User.create({ email, password, role ,status:'active'});
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
