// ISOLATION RULE: Every company-scoped query must include companyId from
// the authenticated recruiter row (resolved via getRecruiterCompany), never
// from a URL parameter or request body. The recruiter cannot control which
// companyId is used to scope their queries.

import { Job } from "./job.model.js";
import { NotFoundError } from "../../shared/errors.js";

export const assertJobOwnership = async (jobId: string, companyId: string) => {
    const job = await Job.findById(jobId);
    if (!job || job.companyId.toString() !== companyId) {
        throw new NotFoundError('Job not found');
    }
}
