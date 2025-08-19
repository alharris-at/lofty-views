# Testing Best Practices

## Test Environment Configuration

### Rate Limiting in Tests

- **Issue**: Rate limiting middleware causes 429 errors during test execution
- **Solution**: Conditionally disable rate limiting in test environment
- **Implementation**: Check `env.isTest` before applying rate limiter middleware

```typescript
// Only apply rate limiting in non-test environments
if (!env.isTest) {
  app.use(rateLimiter);
}
```

### Environment Variables

- Always run tests with `NODE_ENV=test` to ensure proper test configuration
- Use environment-specific configurations to avoid production interference

## Controller Testing Patterns

### Express RequestHandler Mocking

- **Issue**: Express RequestHandler expects 3 parameters (req, res, next) but tests often call with only 2
- **Solution**: Always include mockNext parameter in controller tests

```typescript
let mockNext: Mock;

beforeEach(() => {
  mockNext = vi.fn();
  // ... other setup
});

// Correct controller method call
await userController.createUser(
  mockRequest as Request,
  mockResponse as Response,
  mockNext
);
```

### Service Mocking Strategy

- **Best Practice**: Explicitly define all mocked methods rather than relying on auto-mocking
- **Reason**: Provides better type safety and clearer test intentions

```typescript
// Explicit mock definition
vi.mock("@/api/user/userService", () => ({
  userService: {
    create: vi.fn(),
    deleteById: vi.fn(),
    findAll: vi.fn(),
    findById: vi.fn(),
  },
}));
```

## Integration Testing Patterns

### Data Isolation Between Tests

- **Issue**: Tests interfere with each other when using shared in-memory data stores
- **Solution**: Reset data state before each test using beforeEach hooks

```typescript
beforeEach(() => {
  // Reset shared data store
  users.length = 0;
  users.push(...originalUsers);
});
```

### HTTP Response Testing

- **204 No Content**: Should have empty response body `expect(response.body).toEqual({})`
- **Error Responses**: Should have structured ServiceResponse format with success/message/responseObject
- **Success Responses**: Should include proper status codes and response structure

### Validation Testing

- **ID Validation Rules**:
  - Negative numbers (-1) → 400 Bad Request
  - Zero (0) → 400 Bad Request (must be > 0)
  - Decimal numbers (1.5) → Parsed as integers, may succeed if user exists
  - Non-numeric strings (abc) → 400 Bad Request
  - Special characters (1@2) → 400 Bad Request

## Common Test Failures and Solutions

### Rate Limiting Issues

- **Symptom**: Tests returning 429 status codes
- **Solution**: Disable rate limiting in test environment

### Mock Parameter Mismatches

- **Symptom**: "Expected 3 arguments, but got 2" errors
- **Solution**: Include next parameter in Express handler calls

### Shared State Issues

- **Symptom**: Tests passing individually but failing when run together
- **Solution**: Implement proper test isolation with beforeEach/afterEach hooks

### Response Body Expectations

- **Symptom**: Tests expecting response bodies for 204 responses
- **Solution**: Understand HTTP semantics - 204 responses should not have bodies

## Test Organization

### File Structure

- Keep controller tests focused on HTTP concerns (request/response handling)
- Keep service tests focused on business logic
- Use integration tests for end-to-end API behavior

### Test Categories

- **Unit Tests**: Individual functions/methods in isolation
- **Integration Tests**: API endpoints with real HTTP requests
- **Contract Tests**: Ensure API responses match expected schemas

### Naming Conventions

- Use descriptive test names that explain the scenario and expected outcome
- Group related tests using nested describe blocks
- Follow pattern: "should [expected behavior] when [condition]"

## Debugging Test Failures

### Common Debugging Steps

1. Check environment variables (NODE_ENV=test)
2. Verify mock setup and parameter counts
3. Inspect actual vs expected response structures
4. Check for shared state between tests
5. Validate HTTP status code expectations against actual API behavior

### Logging in Tests

- Use structured logging to understand test execution flow
- Temporarily add console.log statements to inspect request/response data
- Check server logs for rate limiting or validation errors
