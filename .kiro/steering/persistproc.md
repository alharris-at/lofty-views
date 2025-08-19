# Persistproc Integration

## Overview

This project uses **persistproc** for managing development processes in multi-agent workflows. Persistproc allows AI agents to see and control long-running processes like development servers, making development more seamless.

## What is Persistproc?

Persistproc is an MCP (Model Context Protocol) server that:

- Manages long-running development processes
- Captures and streams process output
- Allows agents to start, stop, and restart processes
- Provides centralized logging for all managed processes
- Enables multi-agent collaboration on the same processes

## Installation & Setup

### Prerequisites

- Python 3.10+ with pipx installed
- Node.js with npm/npx for mcp-remote

### Installation

```bash
# Install persistproc globally
pipx install persistproc

# Verify installation
persistproc --help
```

### MCP Configuration

The project includes persistproc in `.kiro/settings/mcp.json`:

```json
{
  "mcpServers": {
    "persistproc": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "http://127.0.0.1:8947/mcp/",
        "--transport",
        "http-only"
      ],
      "disabled": false,
      "autoApprove": ["ctrl", "list", "output"]
    }
  }
}
```

## Usage Workflow

### 1. Start Persistproc Server

In a dedicated terminal (leave running):

```bash
persistproc serve
```

This starts the MCP server on `http://127.0.0.1:8947/mcp/`

### 2. Start Development Processes

Instead of running commands directly, use persistproc:

```bash
# Instead of: pnpm start:dev
persistproc pnpm start:dev

# Instead of: npm run test:watch
persistproc npm run test:watch

# Instead of: docker-compose up
persistproc docker-compose up
```

### 3. Agent Interaction

Once processes are managed by persistproc, agents can:

- **List processes**: See all running development processes
- **Monitor logs**: Get real-time output from any process
- **Restart services**: Restart hung or problematic processes
- **Stop processes**: Clean shutdown of services
- **Debug issues**: Access stderr logs for troubleshooting

## Available Tools

Persistproc exposes these MCP tools:

| Tool     | Description                                          |
| -------- | ---------------------------------------------------- |
| `ctrl`   | Unified process control (start, stop, restart)       |
| `list`   | List all managed processes with status and log paths |
| `output` | Retrieve captured output from processes              |

## Common Commands

### Process Management

```bash
# Start a process
persistproc pnpm start:dev

# List all managed processes
persistproc list

# Get process output
persistproc output --pid <PID>

# Restart a process
persistproc restart --pid <PID>

# Stop a process
persistproc stop --pid <PID>
```

### Agent Commands

When working with agents, you can ask:

- "List the running processes"
- "Show me the latest logs from the dev server"
- "Restart the development server"
- "Check if there are any errors in the API logs"
- "Stop the test runner"

## Benefits for Development

### Multi-Agent Workflows

- Multiple AI agents can see the same processes
- No need to copy/paste logs between agents
- Consistent process state across different tools

### Persistent Processes

- Processes continue running even if terminals are closed
- Centralized process management
- Easy recovery from crashes or hangs

### Enhanced Debugging

- All process output is captured and searchable
- Agents can correlate errors across multiple services
- Real-time monitoring without manual intervention

## Log Storage

Process logs are stored in:

- **Location**: `~/Library/Application Support/persistproc/process_logs/`
- **Format**: `{PID}.{command}.{stream}` (e.g., `12345.pnpm_startdev.stdout`)
- **Streams**: stdout, stderr, combined

## Best Practices

### Process Naming

Use descriptive commands that will be clear in process lists:

```bash
# Good
persistproc pnpm start:dev
persistproc npm run test:watch

# Less clear
persistproc npm start
persistproc node server.js
```

### Development Workflow

1. Start persistproc server once per development session
2. Use persistproc for all long-running development processes
3. Let agents monitor and manage processes as needed
4. Use regular commands for one-off tasks (git, file operations, etc.)

### Troubleshooting

- **Server not starting**: Check if port 8947 is available
- **Processes not visible**: Ensure they were started with `persistproc` command
- **Agent can't connect**: Verify MCP configuration and server status
- **Logs not captured**: Check process permissions and disk space

## Integration with Project

This project's development workflow assumes:

- Development server runs via `persistproc pnpm start:dev`
- Test runners use `persistproc npm run test:watch`
- Agents can monitor build processes and restart services
- All development processes are visible to AI assistants

This enables seamless collaboration between developers and AI agents throughout the development lifecycle.
