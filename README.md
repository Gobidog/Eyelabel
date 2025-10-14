# Label Creation Tool - EYE LIGHTING AUSTRALIA

AI-assisted label creation system for automated product label generation with intelligent field population, GS1 barcode compliance, and workflow management.

## Project Goals

- **Reduce label creation time by 70%** (from 10 minutes to < 2 minutes)
- **Zero errors in barcode generation** (GS1 compliance)
- **100% template accuracy** matching product type
- **Complete audit trail** for compliance

## Project Structure

```
/Eye
├── frontend/          # React + TypeScript + Vite application
├── backend/           # Node.js + Express + TypeORM API
├── ai-service/        # Python FastAPI for AI features
├── shared/            # Shared TypeScript types and utilities
├── docker-compose.yml # Docker orchestration
└── README.md
```

## Technology Stack

### Frontend
- **React 18 + TypeScript + Vite** - Modern, fast development
- **Material-UI v5** - Component library
- **Redux Toolkit** - State management
- **Fabric.js** - Canvas editor for label design
- **AG-Grid Community** - Spreadsheet data grid
- **jsPDF + html2canvas** - PDF generation

### Backend
- **Node.js + Express + TypeScript** - REST API server
- **TypeORM** - Database ORM
- **PostgreSQL 14+** - Primary database
- **Redis** - Caching and job queue
- **Bull** - Background job processing
- **JWT** - Authentication

### AI Service
- **Python FastAPI** - High-performance AI service
- **OpenAI GPT-4.1** - Intelligent spec extraction
- **bwip-js** - GS1 barcode generation

### Infrastructure
- **Docker + Docker Compose** - Containerization
- **AWS S3** - File storage
- **GitHub Actions** - CI/CD

## Features

### Phase 1 (Weeks 1-4) - Foundation ✓
- Monorepo structure
- Docker Compose setup
- PostgreSQL database with 8 tables
- JWT authentication system
- Role-based access control
- Product & Label CRUD APIs
- React frontend with Material-UI
- Authentication flows

### Phase 2 (Weeks 5-8) - Core Features
- CSV/Excel import with column mapping
- Label template system (4 types)
- Canvas editor with Fabric.js
- GS1 barcode generation
- Label preview and export

### Phase 3 (Weeks 9-11) - AI Integration
- Smart specification extraction
- Product type auto-detection
- AI-assisted design (6 variations)
- Real-time suggestions
- Compliance validation

### Phase 4 (Weeks 12-14) - Advanced
- Approval workflow system
- Print-ready PDF export
- SharePoint integration
- Performance optimization
- Comprehensive testing

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local development)
- Python 3.10+ (for AI service development)

### Start All Services

```bash
# Clone and navigate to project
cd Eye

# Start all services with Docker
docker-compose up

# Services will be available at:
# Frontend:    http://localhost:3000
# Backend API: http://localhost:4000
# AI Service:  http://localhost:5000
# PostgreSQL:  localhost:5432
# Redis:       localhost:6379
```

### Development Setup

See individual README files in each service directory:
- `frontend/README.md` - React app setup
- `backend/README.md` - Node.js API setup
- `ai-service/README.md` - Python service setup

## Database Schema

8 core tables:
1. **products** - Product master data with GS1 barcodes
2. **label_templates** - Template definitions (4 types: Standard, CCT, Power, Emergency)
3. **labels** - Label instances with workflow status
4. **label_specifications** - Technical specifications
5. **users** - User management with roles
6. **audit_logs** - Complete audit trail
7. Additional tables for workflow and file management

## API Documentation

Once running, API documentation available at:
- Backend: http://localhost:4000/api-docs (Swagger)
- AI Service: http://localhost:5000/docs (FastAPI auto-docs)

## Development Workflow

```bash
# Install dependencies
cd backend && npm install
cd frontend && npm install
cd ai-service && pip install -r requirements.txt

# Run tests
npm test                    # Backend tests
cd frontend && npm test     # Frontend tests
cd ai-service && pytest     # Python tests

# Build for production
npm run build
```

## Environment Variables

Copy `.env.example` files in each service directory and configure:

```bash
# Backend
DATABASE_URL=postgresql://user:pass@localhost:5432/labeldb
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
AWS_S3_BUCKET=label-files

# AI Service
OPENAI_API_KEY=your-openai-key
```

## Project Status

**Current Phase**: Phase 1 - Foundation
**Progress**: Initializing project structure
**Next Milestone**: Docker Compose setup with all services

## Team Roles

- **Engineers**: Create and edit labels, submit for review
- **Designers**: Design label templates and layouts
- **Approvers**: Review and approve labels
- **Admins**: Full system access

## Performance Targets

- API response: < 200ms (p95)
- PDF generation: < 3 seconds
- CSV import (1000 rows): < 5 seconds
- AI suggestions: < 2 seconds
- Concurrent users: 100+

## Support

For questions or issues, contact the development team.

## License

Proprietary - EYE LIGHTING AUSTRALIA © 2025
