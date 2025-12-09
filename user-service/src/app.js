const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const config = require('./config'); // We need to create this too or mock it
// For skeleton, we can just use basic env vars or a simple config object if config/index.js doesn't exist yet.
// But better to create config/index.js for them too.

const app = express();

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'user-service' });
});

// Basic User Routes (Skeleton)
app.get('/api/users', (req, res) => {
  res.json({ users: [] });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`User Service running on port ${PORT}`);
});

module.exports = app;
