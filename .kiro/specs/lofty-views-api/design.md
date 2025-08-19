# Design Document

## Overview

This design implements a complete CRUD API for managing "Lofty Views" - image resources representing scenic locations with metadata including name, description, location, and heart counts. The implementation follows the established layered architecture pattern used in the existing user management system and integrates seamlessly with the current codebase structure, validation patterns, and error handling mechanisms.

The design leverages an in-memory storage approach similar to the existing UserRepository and maintains consistency with the ServiceResponse pattern for standardized API responses.

## Asana Task References

- **Add Lofty View Model and Controller**: https://app.asana.com/0/1211096092683598/1211096092683617/f (Due: Aug 20, 2025)
- **Add Create Lofty View API**: https://app.asana.com/0/1211096092683598/1211096093554302/f (Due: Aug 20, 2025)
- **Add List Lofty Views API**: https://app.asana.com/0/1211096092683598/1211096093554304/f (Due: Aug 20, 2025)
- **Add Get Views API**: https://app.asana.com/0/1211096092683598/1211096093554306/f (Due: Aug 20, 2025)

## Architecture

### Layered Architecture Pattern

The implementation follows the existing four-layer architecture:

```
Router Layer (loftyViewRouter.ts)
    ↓ HTTP Request/Response handling
Controller Layer (loftyViewController.ts)
    ↓ Request validation & response formatting
Service Layer (loftyViewService.ts)
    ↓ Business logic & error handling
Repository Layer (loftyViewRepository.ts)
    ↓ Data persistence & retrieval
```

### Request Flow

1. **Router**: Defines endpoints, applies middleware, validates request schemas
2. **Controller**: Extracts request data, calls service methods, formats responses
3. **Service**: Implements business logic, handles errors, returns ServiceResponse
4. **Repository**: Manages data operations on in-memory lofty views array

## Components and Interfaces

### Lofty View Model

New schemas and types to be created in `loftyViewModel.ts`:

```typescript
// Core LoftyView entity
export const LoftyViewSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().optional(),
  location: z.string().optional(),
  hearts: z.number().int().min(0),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type LoftyView = z.infer<typeof LoftyViewSchema>;

// Input validation schemas
export const CreateLoftyViewSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    location: z.string().optional(),
  }),
});

export const GetLoftyViewSchema = z.object({
  params: z.object({
    id: commonValidations.id,
  }),
});

export type CreateLoftyViewRequest = z.infer<typeof CreateLoftyViewSchema>;
```

### Repository Layer

The LoftyViewRepository will provide data access operations:

```typescript
export class LoftyViewRepository {
  async findAllAsync(): Promise<LoftyView[]>;
  async findByIdAsync(id: number): Promise<LoftyView | null>;
  async createAsync(
    viewData: Omit<LoftyView, "id" | "hearts" | "createdAt" | "updatedAt">
  ): Promise<LoftyView>;
}
```

### Service Layer

The LoftyViewService will implement business logic:

```typescript
export class LoftyViewService {
  async findAll(): Promise<ServiceResponse<LoftyView[] | null>>;
  async findById(id: number): Promise<ServiceResponse<LoftyView | null>>;
  async create(
    viewData: CreateLoftyViewRequest["body"]
  ): Promise<ServiceResponse<LoftyView | null>>;
}
```

### Controller Layer

The LoftyViewController will handle HTTP-specific concerns:

```typescript
export class LoftyViewController {
  public getLoftyViews: RequestHandler;
  public getLoftyView: RequestHandler;
  public createLoftyView: RequestHandler;
}
```

### Router Layer

The loftyViewRouter will define endpoints with appropriate middleware:

```typescript
// Routes to implement
GET /lofty-views - List all lofty views
GET /lofty-views/:id - Get specific lofty view
POST /lofty-views - Create new lofty view
```

## Data Models

### LoftyView Entity

The core data structure for a lofty view:

```typescript
{
  id: number; // Auto-generated unique identifier
  name: string; // Required display name for the view
  description?: string; // Optional description of the view
  location?: string; // Optional location information
  hearts: number; // Count of user appreciation (initialized to 0)
  createdAt: Date; // Timestamp of creation
  updatedAt: Date; // Timestamp of last update
}
```

### Request/Response Models

**Create Lofty View Request:**

```typescript
{
  name: string; // Required, non-empty
  description?: string; // Optional
  location?: string; // Optional
}
```

**Create Lofty View Response:**

```typescript
ServiceResponse <
  LoftyView >
  {
    success: true,
    message: "Lofty view created successfully",
    responseObject: LoftyView,
    statusCode: 201,
  };
```

**Get All Lofty Views Response:**

```typescript
ServiceResponse<LoftyView[]> {
  success: true,
  message: "Lofty views found",
  responseObject: LoftyView[],
  statusCode: 200,
}
```

**Get Single Lofty View Response:**

```typescript
ServiceResponse <
  LoftyView >
  {
    success: true,
    message: "Lofty view found",
    responseObject: LoftyView,
    statusCode: 200,
  };
```

## Error Handling

### Validation Errors

- **400 Bad Request**: Invalid input data, malformed requests, invalid ID format
- **404 Not Found**: Lofty view not found for GET /lofty-views/:id

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

### Special Cases

- **Empty Collection**: GET /lofty-views returns empty array with 200 status (not 404)
- **ID Validation**: Uses commonValidations.id for consistent ID parsing and validation

## Testing Strategy

### Unit Testing Approach

Following the existing testing patterns in `__tests__/` directories:

**Repository Tests (`loftyViewRepository.test.ts`):**

- Test view creation with valid data
- Test view retrieval (all and by ID)
- Test ID generation and uniqueness
- Test data persistence and timestamps

**Service Tests (`loftyViewService.test.ts`):**

- Test business logic for all CRUD operations
- Test error handling scenarios
- Test ServiceResponse formatting
- Mock repository dependencies

**Controller Tests (`loftyViewController.test.ts`):**

- Test HTTP request/response handling
- Test request validation integration
- Test status code mapping
- Mock service dependencies

**Router Tests (`loftyViewRouter.test.ts`):**

- Test endpoint routing and middleware integration
- Test OpenAPI schema registration
- Test end-to-end request flows using Supertest

### Test Data Management

- Use isolated test data sets
- Reset repository state between tests using beforeEach hooks
- Mock external dependencies consistently

### Coverage Requirements

- Maintain existing coverage standards
- Cover all error paths and edge cases
- Test both success and failure scenarios

## Integration Points

### OpenAPI Documentation

New endpoints will be registered with the OpenAPI registry:

```typescript
// Register LoftyView schema
loftyViewRegistry.register("LoftyView", LoftyViewSchema);

// GET /lofty-views endpoint registration
loftyViewRegistry.registerPath({
  method: "get",
  path: "/lofty-views",
  tags: ["LoftyView"],
  responses: createApiResponse(z.array(LoftyViewSchema), "Success"),
});

// GET /lofty-views/:id endpoint registration
loftyViewRegistry.registerPath({
  method: "get",
  path: "/lofty-views/{id}",
  tags: ["LoftyView"],
  request: { params: GetLoftyViewSchema.shape.params },
  responses: createApiResponse(LoftyViewSchema, "Success"),
});

// POST /lofty-views endpoint registration
loftyViewRegistry.registerPath({
  method: "post",
  path: "/lofty-views",
  tags: ["LoftyView"],
  request: {
    body: {
      content: {
        "application/json": { schema: CreateLoftyViewSchema.shape.body },
      },
    },
  },
  responses: createApiResponse(
    LoftyViewSchema,
    "Lofty view created successfully",
    201
  ),
});
```

### Middleware Integration

All endpoints will use the existing middleware chain:

- Security headers (Helmet)
- CORS handling
- Rate limiting (conditionally disabled in tests)
- Request logging (Pino)
- Request validation (validateRequest)

### ID Generation Strategy

For lofty view creation, implement the same auto-increment strategy as users:

- Find the maximum existing ID in the loftyViews array
- Increment by 1 for new view ID
- Handle edge case of empty array (start with ID 1)

### Hearts Initialization

- All new lofty views start with hearts count of 0
- Hearts field is read-only in the current implementation
- Future enhancement could add endpoints to increment/decrement hearts

### File Structure

The new feature will be organized following the existing pattern:

```
src/api/lofty-view/
├── __tests__/
│   ├── loftyViewController.test.ts
│   ├── loftyViewRepository.test.ts
│   ├── loftyViewRouter.test.ts
│   └── loftyViewService.test.ts
├── loftyViewController.ts
├── loftyViewModel.ts
├── loftyViewRepository.ts
├── loftyViewRouter.ts
└── loftyViewService.ts
```

### Router Registration

The new router will be registered in the main server configuration alongside the existing user router, following the same pattern for route mounting and OpenAPI integration.
