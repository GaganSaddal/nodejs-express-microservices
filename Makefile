.PHONY: help install dev start stop restart logs clean test lint format build

# Colors for terminal output
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[1;33m
NC := \033[0m # No Color

help: ## Show this help message
	@echo '${BLUE}Available commands:${NC}'
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  ${GREEN}%-15s${NC} %s\n", $$1, $$2}'

install: ## Install dependencies for all services
	@echo "${BLUE}Installing dependencies...${NC}"
	@cd shared && npm install
	@cd auth-service && npm install
	@cd user-service && npm install
	@cd notification-service && npm install
	@cd api-gateway && npm install
	@echo "${GREEN}✓ Dependencies installed${NC}"

dev: ## Start all services in development mode
	@echo "${BLUE}Starting services in development mode...${NC}"
	@docker-compose up -d mongodb redis rabbitmq
	@sleep 3
	@cd auth-service && npm run dev & \
	cd user-service && npm run dev & \
	cd notification-service && npm run dev & \
	cd api-gateway && npm run dev

start: ## Start all services with Docker Compose
	@echo "${BLUE}Starting all services...${NC}"
	@docker-compose up -d
	@echo "${GREEN}✓ All services started${NC}"

stop: ## Stop all services
	@echo "${YELLOW}Stopping all services...${NC}"
	@docker-compose down
	@echo "${GREEN}✓ All services stopped${NC}"

restart: stop start ## Restart all services

logs: ## View logs from all services
	@docker-compose logs -f

logs-auth: ## View Auth Service logs
	@docker-compose logs -f auth-service

logs-user: ## View User Service logs
	@docker-compose logs -f user-service

logs-notification: ## View Notification Service logs
	@docker-compose logs -f notification-service

logs-gateway: ## View API Gateway logs
	@docker-compose logs -f api-gateway

clean: ## Clean node_modules and logs
	@echo "${YELLOW}Cleaning...${NC}"
	@find . -name "node_modules" -type d -prune -exec rm -rf '{}' +
	@find . -name "logs" -type d -prune -exec rm -rf '{}' +
	@echo "${GREEN}✓ Cleaned${NC}"

test: ## Run tests for all services
	@echo "${BLUE}Running tests...${NC}"
	@cd auth-service && npm test
	@cd user-service && npm test
	@cd notification-service && npm test
	@cd api-gateway && npm test
	@echo "${GREEN}✓ All tests passed${NC}"

test-auth: ## Run Auth Service tests
	@cd auth-service && npm test

test-user: ## Run User Service tests
	@cd user-service && npm test

test-notification: ## Run Notification Service tests
	@cd notification-service && npm test

test-gateway: ## Run API Gateway tests
	@cd api-gateway && npm test

lint: ## Lint all services
	@echo "${BLUE}Linting...${NC}"
	@cd auth-service && npm run lint
	@cd user-service && npm run lint
	@cd notification-service && npm run lint
	@cd api-gateway && npm run lint
	@echo "${GREEN}✓ Linting complete${NC}"

format: ## Format code for all services
	@echo "${BLUE}Formatting code...${NC}"
	@cd auth-service && npm run format
	@cd user-service && npm run format
	@cd notification-service && npm run format
	@cd api-gateway && npm run format
	@echo "${GREEN}✓ Code formatted${NC}"

build: ## Build Docker images
	@echo "${BLUE}Building Docker images...${NC}"
	@docker-compose build
	@echo "${GREEN}✓ Docker images built${NC}"

db-seed: ## Seed database with sample data
	@echo "${BLUE}Seeding database...${NC}"
	@node scripts/seed.sh
	@echo "${GREEN}✓ Database seeded${NC}"

db-reset: ## Reset database
	@echo "${YELLOW}Resetting database...${NC}"
	@docker-compose down -v
	@docker-compose up -d mongodb
	@echo "${GREEN}✓ Database reset${NC}"

health: ## Check health of all services
	@echo "${BLUE}Checking service health...${NC}"
	@curl -s http://localhost:3000/health && echo " ${GREEN}✓ API Gateway${NC}" || echo " ${YELLOW}✗ API Gateway${NC}"
	@curl -s http://localhost:3001/health && echo " ${GREEN}✓ Auth Service${NC}" || echo " ${YELLOW}✗ Auth Service${NC}"
	@curl -s http://localhost:3002/health && echo " ${GREEN}✓ User Service${NC}" || echo " ${YELLOW}✗ User Service${NC}"
	@curl -s http://localhost:3003/health && echo " ${GREEN}✓ Notification Service${NC}" || echo " ${YELLOW}✗ Notification Service${NC}"

pm2-start: ## Start all services with PM2
	@echo "${BLUE}Starting services with PM2...${NC}"
	@cd auth-service && pm2 start ecosystem.config.js
	@cd user-service && pm2 start ecosystem.config.js
	@cd notification-service && pm2 start ecosystem.config.js
	@cd api-gateway && pm2 start ecosystem.config.js
	@echo "${GREEN}✓ Services started with PM2${NC}"

pm2-stop: ## Stop all PM2 services
	@pm2 stop all

pm2-restart: ## Restart all PM2 services
	@pm2 restart all

pm2-logs: ## View PM2 logs
	@pm2 logs

pm2-monit: ## Monitor PM2 services
	@pm2 monit
