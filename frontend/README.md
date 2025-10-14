# Label Tool - Frontend

React + TypeScript + Vite frontend application for the Label Creation Tool.

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Material-UI v5** - Component library
- **Redux Toolkit** - State management
- **React Router v6** - Routing
- **Axios** - HTTP client
- **Fabric.js** - Canvas manipulation (for label editor)
- **AG-Grid** - Data grid
- **jsPDF** - PDF generation

## Project Structure

```
src/
├── components/       # Reusable React components
│   ├── Layout.tsx    # Main layout with AppBar
│   └── PrivateRoute.tsx # Protected route wrapper
├── pages/           # Page components
│   ├── LoginPage.tsx      # Login page
│   └── DashboardPage.tsx  # Dashboard
├── store/           # Redux state management
│   ├── index.ts           # Store configuration
│   └── authSlice.ts       # Auth slice
├── services/        # API services
│   ├── api.ts             # Axios instance with interceptors
│   └── auth.service.ts    # Auth API calls
├── hooks/           # Custom React hooks
│   └── useAuth.ts         # Auth hook
├── types/           # TypeScript type definitions
│   └── index.ts
├── utils/           # Utility functions
├── assets/          # Static assets
├── theme.ts         # Material-UI theme
├── App.tsx          # Main app component
└── main.tsx         # Entry point
```

## Setup

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Install Dependencies

```bash
npm install
```

### Environment Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Required environment variables:
- `VITE_API_URL` - Backend API URL (default: http://localhost:4000/api)
- `VITE_AI_SERVICE_URL` - AI service URL (default: http://localhost:5000)

## Development

Start development server:

```bash
npm run dev
```

Application will be available at `http://localhost:3000`

## Build

Create production build:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

## Testing

Run tests:

```bash
npm test
```

Run tests with UI:

```bash
npm run test:ui
```

Generate coverage report:

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

## Features

### Authentication
- Login page with email/password
- JWT token-based authentication
- Automatic token refresh
- Protected routes
- User profile management

### Layout
- Responsive Material-UI layout
- AppBar with navigation
- User menu (profile, logout)
- Footer

### State Management
- Redux Toolkit for global state
- Auth slice for authentication state
- Persistent authentication (localStorage)
- Automatic API token injection

### API Integration
- Axios HTTP client
- Automatic request/response interceptors
- JWT token management
- Error handling
- Token refresh on 401

## Pages

### Current (Phase 1)
- **Login** (`/login`) - User authentication
- **Dashboard** (`/dashboard`) - Main dashboard with statistics

### Planned (Future Phases)
- **Products** (`/products`) - Product management
- **Labels** (`/labels`) - Label creation and management
- **Templates** (`/templates`) - Label template management
- **Profile** (`/profile`) - User profile settings
- **Users** (`/users`) - User management (Admin only)

## Path Aliases

TypeScript path aliases for clean imports:

```typescript
import Component from '@/components/Component';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/services/auth.service';
```

## Material-UI Theme

Custom theme configured in `src/theme.ts`:
- Primary color: Blue (#1976d2)
- Secondary color: Pink (#dc004e)
- Custom component styles
- Typography settings
- Responsive breakpoints

## Redux Store

### Auth Slice
- `user` - Current user data
- `tokens` - Access and refresh tokens
- `isAuthenticated` - Authentication status
- `isLoading` - Loading state
- `error` - Error messages

### Actions
- `login` - Login user
- `register` - Register new user
- `logout` - Logout user
- `getProfile` - Fetch user profile

## Protected Routes

Routes wrapped with `<PrivateRoute>` component:
- Automatically redirects to `/login` if not authenticated
- Checks authentication state from Redux store
- Preserves intended destination for post-login redirect

## API Service

### Interceptors
- **Request**: Adds JWT token to Authorization header
- **Response**: Handles 401 errors with automatic token refresh

### Error Handling
- Network errors
- API errors
- Token expiration
- Refresh token flow

## Environment Variables

All environment variables must be prefixed with `VITE_` to be exposed to the client:

```env
VITE_API_URL=http://localhost:4000/api
VITE_AI_SERVICE_URL=http://localhost:5000
VITE_APP_NAME=Label Creation Tool
VITE_APP_VERSION=1.0.0
```

## Docker

Build and run with Docker:

```bash
docker build -t label-frontend .
docker run -p 3000:3000 label-frontend
```

Or use Docker Compose from project root:

```bash
docker-compose up frontend
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

Proprietary - EYE LIGHTING AUSTRALIA
