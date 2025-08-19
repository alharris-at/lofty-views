# Design Document

## Overview

This design extends the existing user management system by adding POST /users (create) and DELETE /users/:id (delete) endpoints to complement the existing GET operations. The implementation follows the established layered architecture pattern and integrates seamlessly with the current codebase structure, validation patterns, and error handling mechanisms.

The design leverages the existing UserRepository in-memory storage approach and maintains consistency with the current ServiceResponse pattern for standardized API responses.

## Asana Task References

- **Add User Creation API**: https://app.asana.com/0/1211096092683598/1211096092683613/f (Due: Aug 21, 2025)
- **Add User Deletion API**: https://app.asana.com/0/1211096092683598/1211096092683615/f (Due: Aug 22, 2025)

## Architecture

### Layered Architecture Pattern

The implementation follows the existing four-layer architecture:

```
Router Layer (userRouter.ts)
    ↓ HTTP Request/Response handling
Controller Layer (userController.ts)
    ↓ Request validation & response formatting
Service Layer (userService.ts)
    ↓ Business logic & error handling
Repository Layer (userRepository.ts)
    ↓ Data persistence & retrieval
```

### Request Flow

1. **Router**: Defines endpoints, applies middleware, validates request schemas
2. **Controller**: Extracts request data, calls service methods, formats responses
3. **Service**: Implements business logic, handles errors, returns ServiceResponse
4. **Repository**: Manages data operations on in-memory user array

## Components and Interfaces

### Enhanced User Model

The existing UserSchema will be extended with input validation schemas:

```typescript
// New schemas to add to userModel.ts
export const CreateUserSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Valid email is required"),
    age: z.number().int().min(0, "Age must be a non-negative integer"),
  }),
});

export const DeleteUserSchema = z.object({
  params: z.object({
    id: commonValidations.id,
  }),
});

// Input type for user creation
export type CreateUserRequest = z.infer<typeof CreateUserSchema>;
```

### Repository Layer Extensions

The UserRepository will be enhanced with create and delete operations:

```typescript
// New methods to add to UserRepository
async createAsync(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>
async deleteByIdAsync(id: number): Promise<boolean>
```

### Service Layer Extensions

The UserService will implement business logic for user creation and deletion:

```typescript
// New methods to add to UserService
async create(userData: CreateUserRequest['body']): Promise<ServiceResponse<User | null>>
async deleteById(id: number): Promise<ServiceResponse<null>>
```

### Controller Layer Extensions

The UserController will handle HTTP-specific concerns:

```typescript
// New methods to add to UserController
public createUser: RequestHandler
public deleteUser: RequestHandler
```

### Router Layer Extensions

The userRouter will define new endpoints with appropriate middleware:

```typescript
// New routes to add
POST /users - Create user endpoint
DELETE /users/:id - Delete user endpoint
```

## Data Models

### User Entity

The existing User model remains unchanged:

```typescript
{
  id: number; // Auto-generated unique identifier
  name: string; // User's display name
  email: string; // User's email address (unique)
  age: number; // User's age
  createdAt: Date; // Timestamp of creation
  updatedAt: Date; // Timestamp of last update
}
```

### Request/Response Models

**Create User Request:**

```typescript
{
  name: string; // Required, non-empty
  email: string; // Required, valid email format
  age: number; // Required, non-negative integer
}
```

**Create User Response:**

```typescript
ServiceResponse <
  User >
  {
    success: true,
    message: "User created successfully",
    responseObject: User,
    statusCode: 201,
  };
```

**Delete User Response:**

```typescript
ServiceResponse <
  null >
  {
    success: true,
    message: "User deleted successfully",
    responseObject: null,
    statusCode: 204,
  };
```

## Error Handling

### Validation Errors

- **400 Bad Request**: Invalid input data, malformed requests
- **409 Conflict**: Duplicate email addresses during creation
- **404 Not Found**: User not found during deletion

### System Errors

- **500 Internal Server Error**: Unexpected system failures

### Error Response Format

All errors follow the standardized ServiceResponse pattern:

```typescript
ServiceResponse<null> {
  success: false,
  message: "Descriptive error message",
  responseObject: null,
  statusCode: <appropriate HTTP status>
}
```

### Validation Error Details

Zod validation errors are transformed into user-friendly messages using the existing validateRequest middleware, providing field-level error information.

## Testing Strategy

### Unit Testing Approach

Following the existing testing patterns in `__tests__/` directories:

**Repository Tests:**

- Test user creation with valid data
- Test user deletion with existing/non-existing IDs
- Test ID generation and uniqueness
- Test email uniqueness validation

**Service Tests:**

- Test business logic for user creation/deletion
- Test error handling scenarios
- Test ServiceResponse formatting
- Mock repository dependencies

**Controller Tests:**

- Test HTTP request/response handling
- Test request validation integration
- Test status code mapping

**Router Tests:**

- Test endpoint routing and middleware integration
- Test OpenAPI schema registration
- Test end-to-end request flows using Supertest

### Test Data Management

- Use isolated test data sets
- Reset repository state between tests
- Mock external dependencies consistently

### Coverage Requirements

- Maintain existing coverage standards
- Cover all error paths and edge cases
- Test both success and failure scenarios

## Integration Points

### OpenAPI Documentation

New endpoints will be registered with the OpenAPI registry:

```typescript
// POST /users endpoint registration
userRegistry.registerPath({
  method: "post",
  path: "/users",
  tags: ["User"],
  request: {
    body: {
      content: { "application/json": { schema: CreateUserSchema.shape.body } },
    },
  },
  responses: createApiResponse(UserSchema, "User created successfully", 201),
});

// DELETE /users/:id endpoint registration
userRegistry.registerPath({
  method: "delete",
  path: "/users/{id}",
  tags: ["User"],
  request: { params: DeleteUserSchema.shape.params },
  responses: {
    204: { description: "User deleted successfully" },
    404: { description: "User not found" },
  },
});
```

### Middleware Integration

Both endpoints will use the existing middleware chain:

- Security headers (Helmet)
- CORS handling
- Rate limiting
- Request logging (Pino)
- Request validation (validateRequest)

### ID Generation Strategy

For user creation, implement a simple auto-increment strategy:

- Find the maximum existing ID in the users array
- Increment by 1 for new user ID
- Handle edge case of empty array (start with ID 1)

### Email Uniqueness

Implement email uniqueness validation in the repository layer:

- Check existing users for duplicate email before creation
- Return appropriate conflict error if duplicate found
