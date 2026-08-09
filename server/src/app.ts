import express from 'express';

const app = express();
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});


export default app;