# Project Structure & Architecture

## Folder Organization

The project follows a feature-based architecture with clear separation of concerns:

```
src/
├── api/                    # Feature-based API modules
│   ├── healthCheck/        # Health check endpoints
│   └── user/              # User management feature
│       ├── __tests__/     # Feature-specific tests
│       ├── userController.ts
│       ├── userModel.ts
│       ├── userRepository.ts
│       ├── userRouter.ts
│       └── userService.ts
├── api-docs/              # OpenAPI/Swagger documentation
├── common/                # Shared utilities and middleware
│   ├── middleware/        # Express middleware
│   ├── models/           # Shared data models
│   └── utils/            # Utility functions
├── index.ts              # Application entry point
└── server.ts             # Express server configuration
```

## Architecture Patterns

### Feature Module Structure

Each API feature follows a consistent layered architecture:

- **Router**: Route definitions and middleware setup
- **Controller**: Request/response handling and HTTP concerns
- **Service**: Business logic and orchestration
- **Repository**: Data access layer (when applicable)
- **Model**: Data structures and validation schemas
- **Tests**: Co-located in `__tests__/` directories

### Common Patterns

- **ServiceResponse**: Standardized API response format with success/failure states
- **Path Aliases**: Use `@/` prefix for clean imports from src root
- **Middleware Chain**: Security → Rate Limiting → Logging → Routes → Error Handling
- **Environment Config**: Centralized in `@/common/utils/envConfig`

## File Naming Conventions

- **camelCase**: For all TypeScript files and variables
- **PascalCase**: For classes and types
- **kebab-case**: For route paths and API endpoints
- **Test Files**: `*.test.ts` in `__tests__/` directories
- **Index Files**: Entry points for modules (index.ts, server.ts)

## Import Guidelines

- Use path aliases (`@/`) for internal imports
- Group imports: external libraries → internal modules → relative imports
- Prefer named exports over default exports for better tree-shaking
- Import types with `type` keyword when used only for typing

## Testing Structure

- Tests co-located with source code in `__tests__/` directories
- Use Supertest for API endpoint testing
- Mock external dependencies in service tests
- Maintain test coverage with meaningful assertions
