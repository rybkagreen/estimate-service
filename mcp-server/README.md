# Estimate Service MCP Server

Model Context Protocol (MCP) server for AI-assisted development of the Estimate Service project.

## Overview

This MCP server provides AI assistants with structured access to development tools and project information for the Estimate Service. It enables seamless integration between AI models and development workflows.

## Features

### Available Tools

- **echo** - Simple echo tool for testing
- **git_status** - Get git repository status
- **git_commit** - Commit changes to git repository  
- **npm_install** - Install npm packages
- **documentation_generate** - Generate project documentation

## Installation

```bash
npm install
npm run build
```

## Usage

### Starting the Server

```bash
npm start
```

The server uses stdio transport and communicates via JSON-RPC messages.

### Development

```bash
npm run dev  # Watch mode with tsx
```

### Building

```bash
npm run build
```

## Configuration

The server uses configuration from `src/config/index.ts`:

- **Project paths** - Root, service, docs, libs paths
- **Environment settings** - Development/production mode
- **Logging** - Winston-based structured logging

## Testing

### Simple Test

```bash
node test-simple.js
```

### Integration with AI Clients

The server can be integrated with MCP-compatible AI clients like Claude Desktop:

1. Add to MCP client configuration:
```json
{
  "mcpServers": {
    "estimate-service": {
      "command": "node",
      "args": ["/path/to/estimate-service/mcp-server/dist/index.js"],
      "cwd": "/path/to/estimate-service"
    }
  }
}
```

2. Restart the AI client to load the server

## Architecture

```
src/
├── index.ts          # Main server implementation
├── config/           # Configuration management
├── utils/           # Utilities (logging, helpers)
└── [future additions]
    ├── tools/       # Tool implementations
    ├── resources/   # Resource providers
    └── services/    # Business logic services
```

## Development Status

**Current Status**: ✅ **Minimal Working Version**

- [x] Basic MCP server setup
- [x] Essential tools (echo, git, npm, docs)
- [x] TypeScript compilation
- [x] Structured logging
- [x] Configuration management

**Planned Enhancements**:

- [ ] Complete tool implementations
- [ ] Resource providers for project files
- [ ] Database integration tools
- [ ] Docker management tools
- [ ] Grand Smeta API integration
- [ ] AI-powered estimation tools
- [ ] Code analysis and quality tools
- [ ] Automated testing tools

## API Reference

### Tools

#### echo
```typescript
{
  name: "echo",
  arguments: {
    text: string  // Text to echo back
  }
}
```

#### git_status
```typescript
{
  name: "git_status",
  arguments: {}  // No arguments required
}
```

#### git_commit
```typescript
{
  name: "git_commit", 
  arguments: {
    message: string,      // Commit message (required)
    files?: string[]      // Files to commit (optional, defaults to all)
  }
}
```

#### npm_install
```typescript
{
  name: "npm_install",
  arguments: {
    packages?: string[],  // Package names (optional)
    dev?: boolean        // Install as dev dependency (optional)
  }
}
```

#### documentation_generate
```typescript
{
  name: "documentation_generate",
  arguments: {
    action: "generate" | "update" | "validate"  // Action to perform
  }
}
```

## Contributing

1. Follow the project's coding standards
2. Add appropriate TypeScript types
3. Update documentation for new tools
4. Test tools thoroughly before submitting

## License

MIT License - see LICENSE file for details.
