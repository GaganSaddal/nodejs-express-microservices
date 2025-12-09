# Production-Ready Node.js Microservices Boilerplate

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)

A complete, production-ready Node.js microservices architecture following 2025 best practices with advanced security, performance optimizations, and comprehensive DevOps support.

## 🏗️ Architecture

This boilerplate implements a microservices architecture with the following services:

- **API Gateway** (Port 3000) - Single entry point, routing, rate limiting
- **Auth Service** (Port 3001) - Authentication, authorization, JWT, OAuth
- **User Service** (Port 3002) - User management, CRUD operations
- **Notification Service** (Port 3003) - Email (SMTP) & Push notifications (FCM)

### Infrastructure

- **MongoDB** - Primary database
- **Redis** - Caching, sessions, rate limiting
- **RabbitMQ/BullMQ** - Message queue for background jobs

## ✨ Features

### 🔐 Security
- ✅ JWT Access + Refresh tokens with secure HTTP-only cookies
- ✅ Role-Based Access Control (RBAC)
- ✅ API Key authentication for internal services
- ✅ Advanced security middlewares (helmet, xss-clean, hpp, cors)
- ✅ Request sanitization (NoSQL injection, XSS)
- ✅ Rate limiting with Redis
- ✅ CSRF token support
- ✅ Account locking after failed login attempts

### 🚀 Performance
- ✅ Redis caching
- ✅ Response compression
- ✅ PM2 cluster mode support
- ✅ Database query optimization
- ✅ Connection pooling

### 🔧 Development
- ✅ Clean MVC architecture
- ✅ Comprehensive error handling
- ✅ Request validation with Joi
- ✅ Logging with Winston + Morgan
- ✅ Hot reload with Nodemon
- ✅ ESLint + Prettier
- ✅ Environment-based configuration

### 📬 Communication
- ✅ Email service with Nodemailer
- ✅ Email templates (welcome, verification, password reset)
- ✅ Firebase Cloud Messaging (FCM) for push notifications
- ✅ BullMQ for background job processing
- ✅ Event-driven architecture

### 🧪 Testing
- ✅ Jest + Supertest setup
- ✅ Unit and integration tests
- ✅ Test coverage reports

### 📚 Documentation
- ✅ Swagger/OpenAPI documentation
- ✅ Comprehensive README
- ✅ API documentation for all routes

### 🐳 DevOps
- ✅ Docker + Docker Compose
- ✅ Multi-stage Dockerfile
- ✅ GitHub Actions CI/CD
- ✅ PM2 ecosystem configuration
- ✅ Health check endpoints

## 📋 Prerequisites

- Node.js >= 18.0.0
- MongoDB >= 6.0
- Redis >= 7.0
- Docker & Docker Compose (optional)
- npm or yarn

## 🚀 Quick Start

### Using Docker (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd nodejs-microservices-boilerplate

# Copy environment variables
cp auth-service/.env.example auth-service/.env
cp user-service/.env.example user-service/.env
cp notification-service/.env.example notification-service/.env
cp api-gateway/.env.example api-gateway/.env

# Start all services with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### Using Makefile

```bash
# Install dependencies for all services
make install

# Start all services in development mode
make dev

# Run tests for all services
make test

# Lint all services
make lint

# Format code
make format

# Clean node_modules and logs
make clean
```

### Manual Setup

```bash
# Install dependencies for each service
cd shared && npm install
cd ../auth-service && npm install
cd ../user-service && npm install
cd ../notification-service && npm install
cd ../api-gateway && npm install

# Start MongoDB
mongod

# Start Redis
redis-server

# Start each service (in separate terminals)
cd auth-service && npm run dev
cd user-service && npm run dev
cd notification-service && npm run dev
cd api-gateway && npm run dev
```

## 🔧 Configuration

### Environment Variables

Each service has its own `.env` file. Copy the `.env.example` file and update the values:

```bash
# Auth Service
cd auth-service
cp .env.example .env
# Edit .env with your configuration

# Repeat for other services
```

### Key Configuration

- **JWT_SECRET**: Change to a strong random string
- **API_KEY_***: Generate unique API keys for each service
- **MONGODB_URI**: Your MongoDB connection string
- **REDIS_HOST/PORT**: Your Redis configuration
- **SMTP_***: Your email provider credentials
- **GOOGLE_CLIENT_ID/SECRET**: For Google OAuth
- **APPLE_***: For Apple OAuth

## 📖 API Documentation

Once the services are running, access the Swagger documentation:

- API Gateway: http://localhost:3000/api-docs
- Auth Service: http://localhost:3001/api-docs
- User Service: http://localhost:3002/api-docs
- Notification Service: http://localhost:3003/api-docs

## 🔑 Authentication Flow

### Register
```bash
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123"
}
```

### Login
```bash
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "Password123"
}
```

### Refresh Token
```bash
POST /api/auth/refresh-tokens
{
  "refreshToken": "your-refresh-token"
}
```

### Protected Routes
```bash
GET /api/auth/me
Headers: {
  "Authorization": "Bearer your-access-token"
}
```

## 🧪 Testing

```bash
# Run tests for all services /
make test

# Run tests for a specific service
cd auth-service && npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm run test:watch
```

## 📦 Project Structure

```
nodejs-microservices-boilerplate/
├── api-gateway/          # API Gateway service
├── auth-service/         # Authentication service
├── user-service/         # User management service
├── notification-service/ # Notification service
├── shared/              # Shared utilities and middleware
├── docker-compose.yml   # Docker Compose configuration
├── Makefile            # Common commands
└── README.md           # This file
```

## 🐳 Docker Commands

```bash
# Build all services
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f [service-name]

# Stop services
docker-compose down

# Remove volumes
docker-compose down -v

# Rebuild and restart
docker-compose up -d --build
```

## 🔄 PM2 Cluster Mode

```bash
# Start with PM2
pm2 start ecosystem.config.js

# Monitor
pm2 monit

# View logs
pm2 logs

# Restart
pm2 restart all

# Stop
pm2 stop all
```

## 📊 Monitoring & Logging

- Logs are stored in `logs/` directory for each service
- Winston logger with daily rotating files
- Morgan for HTTP request logging
- PM2 monitoring dashboard

## 🔒 Security Checklist

- [x] Environment variables properly configured
- [x] Strong JWT secret
- [x] Unique API keys for each service
- [x] HTTPS enabled in production
- [x] CORS properly configured
- [x] Rate limiting enabled
- [x] Input validation on all endpoints
- [x] SQL/NoSQL injection protection
- [x] XSS protection
- [x] CSRF protection
- [x] Secure HTTP headers (helmet)
- [x] Password hashing with bcrypt
- [x] Account lockout mechanism

## 🚀 Deployment

### Production Checklist

1. Update all `.env` files with production values
2. Set `NODE_ENV=production`
3. Use strong secrets and API keys
4. Enable HTTPS
5. Configure proper CORS origins
6. Set up database backups
7. Configure monitoring and alerting
8. Review security settings
9. Enable PM2 cluster mode
10. Set up CI/CD pipeline

### GitHub Actions

The repository includes a GitHub Actions workflow for CI/CD:

- Runs tests on push/PR
- Lints code
- Builds Docker images
- Deploys to production (configure as needed)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 👤 Author

**Gagan Saddal**

## 🙏 Acknowledgments

- Express.js team
- Mongoose team
- All open-source contributors

## 📞 Support

For issues and questions:
- Create an issue on GitHub
- Check the documentation
- Review existing issues

---

**Made with ❤️ for the Node.js community**
