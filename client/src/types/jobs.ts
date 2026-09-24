export type JobStatus = "draft" | "open" | "closed";
export type EmploymentType = "full_time" | "part_time" | "contract" | "internship";
export type WorkplaceType = "onsite" | "remote" | "hybrid";
export type ExperienceLevel = "entry" | "junior" | "mid" | "senior" | "lead";
export type AnswerType = "text" | "number" | "yes_no";

export type JobAttributes = {
  location?: string;
  employmentType?: EmploymentType;
  workplaceType?: WorkplaceType;
  experienceLevel?: ExperienceLevel;
};

export type ScreeningQuestion = {
  id: string;
  question: string;
  answerType: AnswerType;
  required: boolean;
};

export type RecruiterJob = {
  _id: string;
  title: string;
  description: string;
  status: JobStatus;
  deadline?: string;
  attributes: JobAttributes;
  screeningQuestions: ScreeningQuestion[];
  createdAt: string;
  updatedAt: string;
};

export type RecruiterJobSummary = Pick<
  RecruiterJob,
  "_id" | "title" | "status" | "deadline" | "attributes" | "createdAt"
>;
