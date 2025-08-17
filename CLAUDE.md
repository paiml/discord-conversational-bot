# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

### Development Workflow

```bash
# Start development with hot reload
deno task dev
# or
make dev

# Run specific course examples
deno task week1  # Basic Discord bot example
deno task week3  # Conversational bot with state management
deno task week5  # MCP integration example
```

### Testing and Quality

```bash
# Run all tests
deno task test
# or 
make test

# Run tests with coverage
deno task test:coverage
make test-coverage

# Run quality checks (format check, lint, type check)
deno task check
# or
make check

# Full quality validation (check + tests)
deno task quality
# or
make quality
```

### Code Formatting and Linting

```bash
# Format code
deno task fmt
# or
make format

# Lint code
deno task lint
# or
make lint
```

### Build and Deploy

```bash
# Compile to standalone executable
deno task compile
# or
make compile

# Deploy to Deno Deploy
make deploy
```

### PMAT Quality Metrics

```bash
# Calculate PMAT TDG score
deno task tdg
# or
make tdg-score
```

## High-Level Architecture

### Technology Stack

- **Runtime**: Deno (NOT Node.js) - secure TypeScript runtime with built-in tooling
- **Discord Library**: Discordeno v18.0.1 - Native Deno Discord library
- **Quality Standard**: PMAT (Procedural/Modular Analysis Technique) with TDG scoring
- **Protocol**: MCP (Model Context Protocol) for AI integration

### Project Structure

#### Core Bot Architecture

The project implements a progressive learning path through three example bots:

1. **Week 1 Basic Bot** (`src/examples/week1_basic/`)
   - Simple command-response pattern using Discordeno
   - Event-driven architecture with typed handlers
   - Environment validation using Zod schemas

2. **Week 3 Conversational Bot** (`src/examples/week3_conversational/`)
   - Stateful conversation management with context tracking
   - Conversation flows with state transitions
   - User session persistence and topic management

3. **Week 5 MCP Bot** (`src/examples/week5_mcp/`)
   - Model Context Protocol integration for AI features
   - JSON-RPC communication layer
   - Tool and resource management for AI interactions

#### Dependency Management

- All dependencies centralized in `src/deps.ts`
- Version-pinned imports from deno.land for deterministic builds
- No package.json or node_modules - pure Deno approach

#### Quality Standards

- Cyclomatic complexity must be < 10 per function
- 80% minimum test coverage requirement
- Strong typing enforced throughout with TypeScript strict mode
- Input validation using Zod schemas for all external data

### Key Design Patterns

1. **Command Registry Pattern**: All bots use a Map-based command registry for scalable command handling
2. **State Management**: Conversational bots implement a state machine pattern for managing multi-turn conversations
3. **Environment Validation**: All examples validate environment variables at startup using Zod schemas
4. **Error Boundaries**: Comprehensive error handling with proper logging via Deno's std/log

### Environment Configuration

Required environment variables (set in `.env` file):

- `DISCORD_TOKEN`: Discord bot authentication token
- `CLIENT_ID`: Discord application client ID
- `MCP_SERVER_URL`: (Optional) MCP server endpoint for Week 5
- `OPENAI_API_KEY`: (Optional) OpenAI API key for AI features

### Testing Strategy

- Unit tests for individual bot components
- Integration tests for Discord API interactions
- Property-based testing for conversation flows
- Coverage reporting with lcov format
