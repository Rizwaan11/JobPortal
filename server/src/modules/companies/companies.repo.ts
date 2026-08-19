// ISOLATION RULE: Every company-scoped query must include companyId from
// the authenticated recruiter row (resolved via getRecruiterCompany), never
// from a URL parameter or request body. The recruiter cannot control which
// companyId is used to scope their queries.

import { Recruiter } from "./recruiter.model.js";
import { Company } from "./company.model.js";

export const getRecruiterCompany = async (userId: string) => {
    const recruiter = await Recruiter.findOne({ userId });
    if (!recruiter) {
        return null;
    }
    return {
        companyId: recruiter.companyId,
        companyRole: recruiter.companyRole,
    }
}

export const getCompanyById = async (companyId: string) => {
    const company = await Company.findById(companyId);
    return company;
}
