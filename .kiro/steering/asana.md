# Asana Integration Guide

## Project Information

### Lofty Views Project

- **Project ID**: `1211096092683598`
- **Project URL**: https://app.asana.com/1/1211096015720264/project/1211096092683598/board
- **Workspace ID**: `1211096015720264` (My workspace)
- **Sections**:
  - Not Started (ID: 1211096092683599)
  - In Progress (ID: 1211096092683601)
  - Done (ID: 1211096092683602)

## Querying Tasks Effectively

### Method 1: Search All Tasks Then Filter

The most reliable approach discovered:

1. **Search all workspace tasks with wildcard**:

   ```
   mcp_asana_asana_search_tasks(workspace="1211096015720264", text="*")
   ```

2. **Get detailed task information**:

   ```
   mcp_asana_asana_get_multiple_tasks_by_gid(task_ids="comma,separated,ids", opt_fields="name,projects,...")
   ```

3. **Filter by project ID** in the results where `projects` contains the target project ID

### Method 2: Direct Project Queries

- `mcp_asana_asana_get_project()` - Get project details
- `mcp_asana_asana_get_project_sections()` - Get project sections
- `mcp_asana_asana_get_project_task_counts()` - Get task counts (may return empty)

### Known Issues

- Direct project task filtering with `projects_any` parameter in search often returns "Bad Request" errors
- The search API can be finicky with complex filter combinations
- Always use the wildcard text search as a fallback method

## Current Task List (as of Aug 19, 2025)

All tasks in Lofty Views project are currently incomplete and assigned to the main user:

1. **Add Get Views API** (1211096093554306) - No due date
2. **Add List Lofty Views API** (1211096093554304) - No due date
3. **Add Create Lofty View API** (1211096093554302) - No due date
4. **Add Lofty View Model and Controller** (1211096092683617) - Due Aug 25, 2025
5. **Add User Deletion API** (1211096092683615) - Due Aug 22, 2025
6. **Add User Creation API** (1211096092683613) - Due Aug 21, 2025

## Custom Fields and Status Management

### Status Custom Field

The Lofty Views project uses a custom "Status" field to track task progress:

- **Custom Field ID**: `1211096092683608`
- **Available Status Options**:
  - Not Started (ID: 1211096092683609, Color: none)
  - Design (ID: 1211096092683610, Color: yellow)
  - Implementation (ID: 1211096092683611, Color: yellow-green)
  - Done (ID: 1211096203809218, Color: blue-green)

### Priority Custom Field

The project also has a Priority field:

- **Custom Field ID**: `1211096092683603`
- **Available Priority Options**:
  - Low (ID: 1211096092683604, Color: aqua)
  - Medium (ID: 1211096092683605, Color: yellow-orange)
  - High (ID: 1211096092683606, Color: purple)

### Updating Custom Fields

To update a task's status or priority, use the `mcp_asana_asana_update_task` function:

```bash
# Set task status to "Design"
mcp_asana_asana_update_task(
  task_id="TASK_ID",
  custom_fields={"1211096092683608": "1211096092683610"}
)

# Set task priority to "High"
mcp_asana_asana_update_task(
  task_id="TASK_ID",
  custom_fields={"1211096092683603": "1211096092683606"}
)

# Update multiple custom fields at once
mcp_asana_asana_update_task(
  task_id="TASK_ID",
  custom_fields={
    "1211096092683608": "1211096092683610",  # Status: Design
    "1211096092683603": "1211096092683605"   # Priority: Medium
  }
)
```

### Marking Tasks Complete

To mark a task as completed (not just updating the Status custom field), use the `completed` parameter:

```bash
# Mark task as completed
mcp_asana_asana_update_task(
  task_id="TASK_ID",
  completed=true
)

# Mark task as incomplete
mcp_asana_asana_update_task(
  task_id="TASK_ID",
  completed=false
)

# Update both completion status and custom fields
mcp_asana_asana_update_task(
  task_id="TASK_ID",
  completed=true,
  custom_fields={"1211096092683608": "1211096203809218"}  # Status: Done
)
```

## Useful Fields for Task Queries

When requesting task details, include these opt_fields:

- `name,notes,completed,assignee,due_on,created_at,modified_at,tags,projects,memberships,parent,subtasks,custom_fields`

## Quick Commands

```bash
# List workspaces
mcp_asana_asana_list_workspaces()

# Get all tasks in workspace (most reliable)
mcp_asana_asana_search_tasks(workspace="1211096015720264", text="*")

# Get project details
mcp_asana_asana_get_project(project_id="1211096092683598")

# Get multiple task details
mcp_asana_asana_get_multiple_tasks_by_gid(task_ids="id1,id2,id3")
```
