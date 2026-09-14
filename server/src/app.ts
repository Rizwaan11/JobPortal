import express from 'express';
import type { RequestHandler } from 'express';
import cors from 'cors';
import * as helmetModule from 'helmet';
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
import { connectDB } from './shared/db.js';
import { globalLimiter } from './shared/rate-limiter.js';
import { connectRedis } from './shared/redis.js';
import { requestIdMiddleware } from './shared/request-id.js';
import { httpLogger } from './shared/http-logger.js';

const helmet = helmetModule.default as unknown as () => RequestHandler;

await Promise.all([connectDB(), connectRedis()]);

const app = express();
app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(requestIdMiddleware);
app.use(httpLogger);
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
