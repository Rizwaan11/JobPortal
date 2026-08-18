import express from 'express';
import { errorHandler } from './shared/error-handler.js';
import {authRouter} from './modules/auth/auth.routes.js'
const app = express();
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});


app.use('/auth', authRouter);


app.use(errorHandler)
export default app;