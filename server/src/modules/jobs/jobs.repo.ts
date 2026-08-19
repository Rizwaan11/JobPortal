import { Job } from "./job.model.js";
import { NotFoundError } from "../../shared/errors.js";

export const assertJobOwnership = async (jobId: string, companyId: string) => {
    const job = await Job.findById(jobId);
    if (!job || job.companyId.toString() !== companyId) {
        throw new NotFoundError('Job not found');
    }
}
