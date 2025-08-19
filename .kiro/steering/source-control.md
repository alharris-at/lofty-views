# Source Control & Work Tracking

## Commit Workflow for Spec Tasks

When completing work on a spec task, follow this workflow to maintain proper tracking:

### 1. Complete the Implementation

- Implement the feature or task as specified
- Ensure all code is tested and working
- Update any relevant documentation

### 2. Create a Descriptive Commit

Create a commit with a clear, descriptive message that references the spec and task:

```bash
git add .
git commit -m "feat: implement user creation API

- Add POST /users endpoint with validation
- Implement UserService.createUser method
- Add comprehensive tests for user creation
- Update API documentation

Spec: .kiro/specs/user-management-api/
Task: Add User Creation API"
```

### 3. Update Task Tracking

After committing, update the relevant task list (usually `tasks.md` in the spec directory) with:

- Mark the task as completed
- Reference the commit ID
- Include any relevant notes about the implementation

Example task list update:

```markdown
## Implementation Tasks

### ✅ Completed

- [x] **Add User Creation API**
  - Commit: `abc123def` - feat: implement user creation API
  - Completed: 2025-08-19
  - Notes: Includes validation, error handling, and comprehensive tests

### 🔄 In Progress

- [ ] **Add User Deletion API**
  - Status: Design phase
  - Assigned: Current sprint

### 📋 Pending

- [ ] **Add User Update API**
  - Dependencies: User creation API
```

## Commit Message Guidelines

### Format

Use conventional commit format:

```
<type>(<scope>): <description>

<body>

<footer>
```

### Types

- `feat`: New feature implementation
- `fix`: Bug fixes
- `docs`: Documentation updates
- `test`: Adding or updating tests
- `refactor`: Code refactoring without feature changes
- `chore`: Maintenance tasks

### Examples

```bash
# Feature implementation
git commit -m "feat(user): implement user creation API with validation"

# Bug fix
git commit -m "fix(user): handle duplicate email validation correctly"

# Documentation
git commit -m "docs(api): update user endpoints documentation"

# Tests
git commit -m "test(user): add comprehensive user service tests"
```

## Integration with Asana

When updating Asana tasks after commits:

1. **Add commit reference to task notes**:

   ```
   Implementation completed in commit: abc123def

   Changes include:
   - Feature implementation
   - Tests added
   - Documentation updated
   ```

2. **Update task status** to "Done" using custom fields
3. **Add completion comment** with commit details

## Best Practices

- **Atomic commits**: Each commit should represent a single, complete change
- **Clear messages**: Commit messages should be self-explanatory
- **Reference tracking**: Always link commits back to specs and tasks
- **Documentation**: Update task lists promptly after commits
- **Testing**: Ensure all tests pass before committing
- **Review**: Self-review changes before committing

## Automation Opportunities

Consider creating hooks or scripts to:

- Auto-update task lists with commit references
- Generate commit messages from task descriptions
- Update Asana tasks automatically after commits
- Create pull request templates that reference spec tasks
