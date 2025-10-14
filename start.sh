#!/bin/bash

# Label Creation Tool - Startup Script
# This script initializes and starts all services

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  EYE LIGHTING AUSTRALIA - Label Creation Tool${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${RED}✗ Error: .env file not found${NC}"
    echo -e "${YELLOW}  Please copy .env.example to .env and configure it${NC}"
    echo -e "  ${YELLOW}cp .env.example .env${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Environment file found${NC}"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}✗ Error: Docker is not running${NC}"
    echo -e "${YELLOW}  Please start Docker Desktop and try again${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Docker is running${NC}"

# Build and start services
echo ""
echo -e "${BLUE}━━━ Building Docker Images ━━━${NC}"
docker-compose build

echo ""
echo -e "${BLUE}━━━ Starting Services ━━━${NC}"
docker-compose up -d

# Wait for database to be ready
echo ""
echo -e "${YELLOW}⏳ Waiting for database to be ready...${NC}"
sleep 5

# Run database migrations
echo ""
echo -e "${BLUE}━━━ Running Database Migrations ━━━${NC}"
docker-compose exec -T backend npm run migration:run || echo -e "${YELLOW}⚠ No migrations to run${NC}"

# Seed the database
echo ""
echo -e "${BLUE}━━━ Seeding Database ━━━${NC}"
docker-compose exec -T backend npm run seed

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  ✓ Application started successfully!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}Services:${NC}"
echo -e "  Frontend:  ${GREEN}http://localhost:3000${NC}"
echo -e "  Backend:   ${GREEN}http://localhost:4000${NC}"
echo -e "  AI Service:${GREEN}http://localhost:5000${NC}"
echo ""
echo -e "${BLUE}Test Credentials:${NC}"
echo -e "  Admin:    ${GREEN}admin@eyelighting.com.au / admin123${NC}"
echo -e "  Engineer: ${GREEN}engineer@eyelighting.com.au / engineer123${NC}"
echo -e "  Designer: ${GREEN}designer@eyelighting.com.au / designer123${NC}"
echo -e "  Approver: ${GREEN}approver@eyelighting.com.au / approver123${NC}"
echo ""
echo -e "${BLUE}Useful Commands:${NC}"
echo -e "  View logs:      ${YELLOW}docker-compose logs -f${NC}"
echo -e "  Stop services:  ${YELLOW}docker-compose down${NC}"
echo -e "  Restart:        ${YELLOW}docker-compose restart${NC}"
echo -e "  View status:    ${YELLOW}docker-compose ps${NC}"
echo ""
