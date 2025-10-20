# Label Tool - Backend API

Node.js + Express + TypeScript + TypeORM backend service for the Label Creation Tool.

## Tech Stack

- **Node.js** 18+
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **TypeORM** - Database ORM
- **PostgreSQL** - Primary database
- **Redis** - Caching and job queue
- **Bull** - Background job processing
- **JWT** - Authentication
- **Winston** - Logging

## Project Structure

```
src/
├── config/           # Configuration files
│   ├── database.ts   # TypeORM configuration
│   └── redis.ts      # Redis client setup
├── controllers/      # Request handlers
├── entities/         # TypeORM entities
├── middleware/       # Express middleware
│   └── error.middleware.ts
├── migrations/       # Database migrations
├── routes/          # API route definitions
├── services/        # Business logic
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
│   └── logger.ts    # Winston logger
└── index.ts         # Application entry point
```

## Setup

### Prerequisites

- Node.js 18 or higher
- PostgreSQL 14+ running
- Redis running

### Install Dependencies

```bash
npm install
```

### Environment Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
# Edit .env with your settings
```

Required environment variables:
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `JWT_SECRET` - Secret key for JWT tokens

### Database Setup

Run migrations:

```bash
npm run migration:run
```

Generate new migration:

```bash
npm run migration:generate -- src/migrations/MigrationName
```

### Seed Development Data

Populate database with test data for development:

```bash
npm run seed
```

This creates:
- **4 test users** (one per role: admin, engineer, designer, approver)
- **10 sample products** (realistic lighting products with GS1 barcodes)
- **4 label templates** (Standard, CCT Selectable, Power Selectable, Emergency)
- **5 sample labels** (various workflow states)

**Test User Credentials:**
```
ADMIN      | admin@eyelighting.com.au     | admin123
ENGINEER   | engineer@eyelighting.com.au  | engineer123
DESIGNER   | designer@eyelighting.com.au  | designer123
APPROVER   | approver@eyelighting.com.au  | approver123
```

**Note:** The seed script is idempotent - safe to run multiple times. Existing records are skipped.

## Development

Start development server with hot reload:

```bash
npm run dev
```

Server will be available at `http://localhost:4000`

## Build

Compile TypeScript to JavaScript:

```bash
npm run build
```

## Production

Run compiled code:

```bash
npm start
```

## Testing

Run tests:

```bash
npm test
```

Watch mode:

```bash
npm run test:watch
```

Coverage report:

```bash
npm run test:coverage
```

## Linting

Check code style:

```bash
npm run lint
```

Fix linting issues:

```bash
npm run lint:fix
```

## API Documentation

Once running, API documentation will be available at:
- Swagger UI: `http://localhost:4000/api-docs`
- Health check: `http://localhost:4000/health`

## Key Features

### Authentication
- JWT-based authentication
- Role-based access control (engineer, designer, approver, admin)
- Token refresh mechanism

### Products API
- CRUD operations for products
- Bulk import from CSV/Excel
- GS1 barcode validation

### Labels API
- Label creation and management
- Template selection
- Status workflow (draft → design → review → approved → sent)
- PDF export

### AI Integration
- Connects to Python AI service
- Specification extraction
- Template suggestions
- Validation

## Database Schema

8 core tables:
1. **products** - Product master data
2. **label_templates** - Template definitions (JSONB)
3. **labels** - Label instances with status workflow
4. **label_specifications** - Technical specifications
5. **users** - User management with roles
6. **audit_logs** - Complete audit trail
7. Additional tables for workflow management

## Error Handling

All errors are handled by centralized error middleware:
- Operational errors return appropriate status codes
- Unexpected errors logged and return 500
- Development mode includes stack traces

## Logging

Winston logger with different levels:
- `error` - Error conditions
- `warn` - Warning conditions
- `info` - Informational messages
- `debug` - Debug-level messages

Logs are:
- Console output (colorized)
- File output in production (`logs/error.log`, `logs/combined.log`)

## Performance

- Redis caching for frequent queries
- Background job processing with Bull
- Rate limiting (100 requests per 15 minutes)
- Compression middleware
- Connection pooling

## Security

- Helmet.js for HTTP headers
- CORS configuration
- Rate limiting
- Input validation
- SQL injection prevention (TypeORM parameterized queries)
- XSS protection

## License

Proprietary - EYE LIGHTING AUSTRALIA
