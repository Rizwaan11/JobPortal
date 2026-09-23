export type ResumeSummary = {
  _id: string;
  filename: string;
  uploadedAt: string;
  wordCount: number | null;
};

export type ApplicantProfile = {
  _id: string;
  fullName: string;
  headline?: string;
  location?: string;
  attributes: {
    skills: string[];
    portfolioLinks: string[];
    yearsOfExperience?: number;
  };
  resume: ResumeSummary | null;
};

export type ShortlistItem = {
  _id: string;
  jobId: {
    _id: string;
    title: string;
    status: "draft" | "open" | "closed";
    deadline?: string;
    attributes?: {
      location?: string;
    };
    companyId: {
      _id: string;
      name: string;
    } | null;
  } | null;
};
