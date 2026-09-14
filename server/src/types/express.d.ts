
declare namespace Express {
  interface Request {
    id: string;
    user?: {
      userId: string;
      role:   'admin' | 'recruiter' | 'applicant';
    };
  }
}
