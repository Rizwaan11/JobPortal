import express from 'express';
import { errorHandler } from './shared/error-handler.js';
import {authRouter} from './modules/auth/auth.routes.js'
import {applicantsRouter} from './modules/applicants/applicants.routes.js'
import {companiesRouter} from './modules/companies/companies.routes.js'
import {adminRouter} from './modules/admin/admin.routes.js'
import {jobsRouter} from './modules/jobs/jobs.routes.js'



const app = express();
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});


app.use('/api/auth', authRouter);
app.use('/api/applicants', applicantsRouter);
app.use('/api/companies', companiesRouter);
app.use('/api/admin', adminRouter);
app.use('/api/jobs', jobsRouter);


app.use(errorHandler)
export default app;
