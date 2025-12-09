const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');

const app = express();

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'notification-service' });
});

// Basic Notification Routes (Skeleton)
app.post('/api/notifications/email', (req, res) => {
  res.json({ message: 'Email queued' });
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`Notification Service running on port ${PORT}`);
});

module.exports = app;
