# Build with AI: Developing Discord Bots Conversationally (Deno TypeScript)

[![CI](https://github.com/course/discord-bot-conversational/actions/workflows/ci.yml/badge.svg)](https://github.com/course/discord-bot-conversational/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/course/discord-bot-conversational/branch/main/graph/badge.svg)](https://codecov.io/gh/course/discord-bot-conversational)
[![PMAT TDG](https://img.shields.io/badge/PMAT%20TDG-92%25-brightgreen)](https://github.com/course/discord-bot-conversational)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Deno](https://img.shields.io/badge/Deno-1.39+-blue)](https://deno.land)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![Test Coverage](https://img.shields.io/badge/coverage-80%25-green)](https://github.com/course/discord-bot-conversational)
[![Code Quality](https://img.shields.io/badge/quality-A+-brightgreen)](https://github.com/course/discord-bot-conversational)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/course/discord-bot-conversational/pulls)

A comprehensive course for building production-ready Discord bots with conversational AI capabilities using **Deno TypeScript**, MCP (Model Context Protocol), and PMAT quality standards.

## 🎯 Course Overview

**Duration**: 10 weeks (45 hours)\
**Level**: Intermediate\
**Format**: Project-based learning with hands-on examples\
**Runtime**: Deno TypeScript (No Node.js required!)

Learn to build sophisticated Discord bots that leverage AI for natural conversations, implement enterprise-grade quality standards, and scale to production environments.

## 📚 What You'll Learn

- **Deno TypeScript Fundamentals**: Master modern TypeScript with Deno's secure runtime
- **Discord Bot Development**: Build bots using Discordeno (Native Deno Discord library)
- **Conversational Design**: Create stateful, context-aware conversation flows
- **AI Integration**: Implement MCP protocol for AI-powered features
- **Quality Engineering**: Apply PMAT standards for production-ready code
- **DevOps Practices**: Deploy to Deno Deploy with zero configuration

## 🚀 Quick Start

### Prerequisites

- Deno 1.39+ (install from https://deno.land)
- Discord account and server for testing
- Git and command line familiarity

### Installation

```bash
# Clone the repository
git clone https://github.com/course/discord-bot-conversational.git
cd discord-bot-conversational

# Set up environment variables
cp .env.example .env
# Edit .env with your Discord bot token

# Cache dependencies
make cache

# Run the basic example
make week1
```

## 📖 Course Structure

### Week 1-2: Foundations

- Deno runtime and permissions model
- Discord API with Discordeno library
- Event handling and commands
- Error handling patterns

### Week 3-4: Conversational Architecture

- State management
- Conversation flows
- Natural language processing
- Context persistence

### Week 5-6: MCP Integration

- Model Context Protocol setup
- AI tool implementation
- Prompt engineering
- Quality validation with PMCP

### Week 7-8: Production Engineering

- PMAT quality gates
- Testing strategies
- CI/CD with GitHub Actions
- Deno Deploy

### Week 9-10: Advanced Features

- Multi-server architecture
- Specialized bot types
- Advanced Discord features
- Final project

## 💻 Examples

### Basic Bot (Week 1)

```typescript
import { BasicBot } from './src/examples/week1_basic/mod.ts';

const bot = new BasicBot();
await bot.start();
```

### Conversational Bot (Week 3)

```typescript
import { ConversationalBot } from './src/examples/week3_conversational/mod.ts';

const bot = new ConversationalBot();
await bot.start();
```

## 🛠️ Development

### Available Commands

```bash
make help          # Show all commands
make dev           # Start development server
make test          # Run tests
make test-coverage # Run tests with coverage
make lint          # Check code quality
make format        # Format code
make compile       # Build standalone executable
make deploy        # Deploy to Deno Deploy
```

### Quality Standards (PMAT)

All code must pass:

- ✅ Deno linting rules
- ✅ 80% test coverage
- ✅ Cyclomatic complexity < 10
- ✅ No self-admitted technical debt
- ✅ Full documentation coverage

## 📁 Project Structure

```
discord-conversational-bot/
├── src/
│   ├── deps.ts                    # Central dependencies
│   ├── main.ts                    # Entry point
│   └── examples/
│       ├── week1_basic/           # Basic bot
│       ├── week3_conversational/  # Stateful conversations
│       └── week5_mcp/            # AI integration via MCP
├── scripts/
│   └── calculate_tdg.ts          # PMAT TDG calculator
├── docs/
│   ├── course-structure.md       # Course outline
│   └── todo/
│       └── course-discord-bot.md # PDMT task specification
├── deno.json                     # Deno configuration
├── Makefile                      # Build commands
└── .github/
    └── workflows/               # CI/CD pipelines
```

## 🔧 Deno Configuration

The project uses Deno's built-in tools:

- **Formatter**: `deno fmt`
- **Linter**: `deno lint`
- **Test Runner**: `deno test`
- **Type Checker**: `deno check`
- **Compiler**: `deno compile`

No package.json, no node_modules, no build step required!

## 📊 Assessment

- **Continuous Assessment** (60%)
  - Weekly labs and exercises
  - Code reviews
  - Quizzes and participation

- **Project Assessment** (40%)
  - Midterm project
  - Final production bot

## 🎓 Certification

Upon successful completion:

- Course certificate
- GitHub portfolio showcase
- Deno Deploy credits
- Alumni network access

## 🤝 Support

- **Discord Server**: Join our community for help
- **Office Hours**: Live support sessions 3x weekly
- **Documentation**: Comprehensive guides and API references
- **Issue Tracker**: Report bugs and request features

## 🚢 Deployment

Deploy your bot to Deno Deploy:

```bash
# Compile standalone executable
make compile

# Deploy to Deno Deploy
make deploy
```

## 📝 License

This course is released under the MIT License. See [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- Deno team for the amazing runtime
- Discord.js and Discordeno communities
- MCP protocol contributors
- PMAT/PDMT methodology creators
- Course participants and contributors

---

**Ready to build amazing Discord bots with Deno?** Start with Week 1 and progress at your own pace!

For detailed course information, see [docs/course-structure.md](docs/course-structure.md).\
For the complete task list, see [docs/todo/course-discord-bot.md](docs/todo/course-discord-bot.md).
