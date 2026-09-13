import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler } from './shared/error-handler.js';
import {authRouter} from './modules/auth/auth.routes.js'
import {applicantsRouter} from './modules/applicants/applicants.routes.js'
import {companiesRouter} from './modules/companies/companies.routes.js'
import {adminRouter} from './modules/admin/admin.routes.js'
import {jobsRouter} from './modules/jobs/jobs.routes.js'
import { publicRouter } from './modules/public/public.routes.js'
import { applicationsRouter } from './modules/applications/applications.routes.js'
import { healthRouter } from './modules/health/health.routes.js';
import { config } from './shared/config.js';
import { globalLimiter } from './shared/rate-limiter.js';


const app = express();
app.disable('x-powered-by');
app.use(helmet());
app.use(cors({
  origin: config.FRONTEND_URL,
  credentials: true,
}));
app.use(globalLimiter);
app.use(express.json());

app.use(healthRouter);

app.use('/api/auth', authRouter);
app.use('/api/applicants', applicantsRouter);
app.use('/api/companies', companiesRouter);
app.use('/api/admin', adminRouter);
app.use('/api/jobs', jobsRouter);
app.use('/api/public', publicRouter);
app.use('/api/applications', applicationsRouter);


app.use(errorHandler)
export default app;
