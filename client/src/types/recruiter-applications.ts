import type { ScreeningQuestion } from "@/types/jobs";

export const applicationStages = [
  "applied",
  "screening",
  "interview",
  "final_interview",
  "offer",
  "hired",
  "rejected",
] as const;

export type ApplicationStage = (typeof applicationStages)[number];

export type ScreeningAnswer = {
  questionId: string;
  answer: string | number | boolean;
};

export type RecruiterApplication = {
  _id: string;
  jobTitle: string;
  stage: ApplicationStage;
  status: "active" | "withdrawn";
  createdAt: string;
  applicant: {
    fullName: string;
    headline: string | null;
    location: string | null;
    skills: string[];
    portfolioLinks: string[];
    yearsOfExperience: number | null;
    hasResume: boolean;
  };
  screeningQuestions: ScreeningQuestion[];
  answers: ScreeningAnswer[];
  latestInterview: {
    _id: string;
    scheduledAt: string;
    meetingLink: string;
    notes: string | null;
    feedback: string | null;
    outcome: "pending" | "moved_forward" | "rejected";
  } | null;
};

export type ApplicationPipeline = Record<ApplicationStage, RecruiterApplication[]>;
