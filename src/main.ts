#!/usr/bin/env -S deno run --allow-net --allow-env --allow-read

import { loadEnv } from './deps.ts';

// Load environment variables
await loadEnv({ export: true });

console.log(`
╔════════════════════════════════════════════════════════╗
║  Discord Bot Conversational Course - Deno TypeScript  ║
╚════════════════════════════════════════════════════════╝

Welcome to the Discord Bot Development Course!

This course teaches you how to build production-ready Discord bots
using Deno TypeScript with conversational AI capabilities.

Available examples:
  • Week 1: Basic Bot - Run with 'make week1'
  • Week 3: Conversational Bot - Run with 'make week3'  
  • Week 5: MCP Integration - Run with 'make week5'

Get started:
  1. Copy .env.example to .env
  2. Add your Discord bot token
  3. Run 'make dev' to start development

Documentation: docs/course-structure.md
Todo List: docs/todo/course-discord-bot.md

Happy coding! 🚀
`);

// Export for module usage
export { BasicBot } from './examples/week1_basic/mod.ts';
export { ConversationalBot } from './examples/week3_conversational/mod.ts';
