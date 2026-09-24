export type CompanyRole = "owner" | "hr_manager" | "recruiter" | "hiring_manager";

export type EditableCompanyRole = Exclude<CompanyRole, "owner">;

export type CompanyMember = {
  _id: string;
  userId: {
    _id: string;
    email: string;
  };
  companyRole: CompanyRole;
  createdAt: string;
};
