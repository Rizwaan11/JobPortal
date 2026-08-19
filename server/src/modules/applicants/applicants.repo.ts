import { Applicant } from "./applicant.model.js";
import { NotFoundError } from "../../shared/errors.js";

export const assertApplicantOwnership = async (applicantId: string, userId: string) => {
    const applicant = await Applicant.findById(applicantId);
    if (!applicant || applicant.userId.toString() !== userId) {
        throw new NotFoundError('Applicant not found');
    }
}
