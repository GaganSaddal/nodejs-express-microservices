# 🚀 Quick Start Guide

## Prerequisites
- Node.js >= 18.0.0
- MongoDB >= 6.0
- Redis >= 7.0
- Docker & Docker Compose (optional but recommended)

## Installation

### Option 1: Docker (Recommended)

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd nodejs-microservices-boilerplate

# 2. Copy environment files
cp auth-service/.env.example auth-service/.env
cp api-gateway/.env.example api-gateway/.env
cp user-service/.env.example user-service/.env
cp notification-service/.env.example notification-service/.env

# 3. Update environment variables (especially secrets!)
# Edit each .env file with your configuration

# 4. Start all services
docker-compose up -d

# 5. View logs
docker-compose logs -f

# 6. Check health
make health
```

### Option 2: Manual Setup

```bash
# 1. Install dependencies
make install

# 2. Start MongoDB and Redis
mongod
redis-server

# 3. Copy and configure environment files
cp auth-service/.env.example auth-service/.env
# Edit .env files

# 4. Start services (in separate terminals)
cd auth-service && npm run dev
cd api-gateway && npm run dev
cd user-service && npm run dev
cd notification-service && npm run dev
```

## First Steps

### 1. Test the API

```bash
# Health check
curl http://localhost:3000/health

# Register a user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Password123"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123"
  }'
```

### 2. Access Swagger Documentation

Open your browser and navigate to:
- http://localhost:3000/api-docs

### 3. View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f auth-service
```

## Common Commands

```bash
make install    # Install all dependencies
make dev        # Start in development mode
make start      # Start with Docker Compose
make stop       # Stop all services
make restart    # Restart all services
make logs       # View all logs
make test       # Run all tests
make lint       # Lint all services
make format     # Format code
make clean      # Clean node_modules and logs
make health     # Check service health
```

## Environment Variables

### Critical Variables to Update

**Auth Service (.env)**
```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
API_KEY_GATEWAY=gateway-api-key-change-this
API_KEY_USER_SERVICE=user-service-api-key-change-this
API_KEY_NOTIFICATION_SERVICE=notification-service-api-key-change-this

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@yourapp.com
```

**MongoDB Connection**
```env
MONGODB_URI=mongodb://localhost:27017/auth-service
```

**Redis Connection**
```env
REDIS_HOST=localhost
REDIS_PORT=6379
```

## Production Deployment

### 1. Update Environment Variables
- Set `NODE_ENV=production`
- Use strong secrets and API keys
- Configure proper CORS origins
- Set up SSL/TLS certificates

### 2. Build Docker Images
```bash
docker-compose -f docker-compose.prod.yml build
```

### 3. Deploy with PM2
```bash
make pm2-start
```

### 4. Monitor
```bash
pm2 monit
pm2 logs
```

## Troubleshooting

### Services won't start
```bash
# Check if ports are in use
lsof -i :3000
lsof -i :3001

# Check Docker logs
docker-compose logs
```

### MongoDB connection issues
```bash
# Verify MongoDB is running
mongosh

# Check connection string in .env
```

### Redis connection issues
```bash
# Verify Redis is running
redis-cli ping

# Should return PONG
```

## Next Steps

1. **Customize Auth Service** - Add more OAuth providers
2. **Implement User Service** - Complete CRUD operations
3. **Implement Notification Service** - Add FCM push notifications
4. **Add More Tests** - Increase coverage
5. **Set up Monitoring** - Add Prometheus/Grafana
6. **Configure CI/CD** - Update GitHub Actions with your deployment

## Support

- 📖 Read the [README.md](./README.md)
- 📝 Check the [Walkthrough](./walkthrough.md)
- 🐛 Report issues on GitHub
- 💬 Join our community

---

**Happy Coding! 🎉**
