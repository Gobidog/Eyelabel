# @eye/shared

Shared TypeScript types and interfaces for the Eye Label Creation Tool.

## Purpose

This package contains common type definitions used by both the frontend and backend services to ensure type consistency across the application.

## Structure

```
shared/
├── src/
│   └── types/
│       ├── User.ts         # User and authentication types
│       ├── Product.ts      # Product types
│       ├── Label.ts        # Label and label data types
│       ├── Template.ts     # Template types
│       └── index.ts        # Barrel export
├── package.json
├── tsconfig.json
└── README.md
```

## Usage

### In Backend

```typescript
import { User, UserRole, CreateProductDto } from '@eye/shared';
```

### In Frontend

```typescript
import { Label, LabelStatus, ApiResponse } from '@eye/shared';
```

## Development

```bash
# Install dependencies
npm install

# Build types
npm run build

# Watch for changes
npm run watch
```

## Types Included

- **User**: User entities, roles, and DTOs
- **Product**: Product entities and DTOs
- **Label**: Label entities, status, and data structures
- **Template**: Template entities and configurations
- **Common**: API responses, pagination, authentication

## Notes

- All types are TypeScript-only (no runtime code)
- Compiled to CommonJS for compatibility
- Declaration files (.d.ts) generated for type checking
- Used as a local package via relative path or workspace
