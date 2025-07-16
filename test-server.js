const express = require('express');
const app = express();
const port = 3022;

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ 
    message: 'Estimate Service Test Server',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'estimate-service',
    uptime: process.uptime()
  });
});

app.listen(port, () => {
  console.log(`Test server running at http://localhost:${port}`);
  console.log(`Health check at http://localhost:${port}/health`);
});
