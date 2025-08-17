/**
 * Week 1: Basic Discord Bot using Discordeno
 * PMAT Quality Standards Applied
 * Cyclomatic Complexity: < 10 per function
 */

import {
  Bot,
  createBot,
  Intents,
  loadEnv,
  log,
  Message,
  sendMessage,
  startBot,
  z,
} from '../../deps.ts';

// Load environment variables
await loadEnv({ export: true });

// Environment validation schema (PMAT: Input validation)
const EnvSchema = z.object({
  DISCORD_TOKEN: z.string().min(1),
  CLIENT_ID: z.string().min(1),
});

const env = EnvSchema.parse(Deno.env.toObject());

/**
 * BasicBot class implementing fundamental Discord bot functionality
 * Following PMAT quality standards with proper error handling
 */
export class BasicBot {
  private bot: Bot;
  private readonly prefix = '!';
  private readonly commands: Map<string, CommandHandler>;

  constructor() {
    // Initialize Discordeno bot with required intents
    this.bot = createBot({
      token: env.DISCORD_TOKEN,
      intents: Intents.Guilds | Intents.GuildMessages | Intents.MessageContent,
    });

    // Initialize command registry
    this.commands = new Map();
    this.registerCommands();
    this.setupEventHandlers();
  }

  /**
   * Register all available commands
   * PMAT: Single Responsibility Principle
   */
  private registerCommands(): void {
    this.commands.set('ping', this.handlePing.bind(this));
    this.commands.set('echo', this.handleEcho.bind(this));
    this.commands.set('info', this.handleInfo.bind(this));
    this.commands.set('help', this.handleHelp.bind(this));
  }

  /**
   * Setup event handlers for the bot
   * PMAT: Separation of concerns
   */
  private setupEventHandlers(): void {
    // Ready event
    this.bot.events.ready = (_bot, payload) => {
      log.info(`✅ Bot logged in as ${payload.user.username}`);
    };

    // Message create event
    this.bot.events.messageCreate = async (bot, message) => {
      await this.handleMessage(bot, message);
    };
  }

  /**
   * Handle incoming messages
   * PMAT: Cyclomatic complexity kept low through early returns
   */
  private async handleMessage(bot: Bot, message: Message): Promise<void> {
    // Ignore bot messages
    if (message.isFromBot) return;

    // Check for command prefix
    if (!message.content.startsWith(this.prefix)) return;

    // Parse command and arguments
    const args = message.content.slice(this.prefix.length).trim().split(/\s+/);
    const commandName = args.shift()?.toLowerCase();

    if (!commandName) return;

    // Execute command if it exists
    const command = this.commands.get(commandName);
    if (command) {
      try {
        await command(bot, message, args);
      } catch (error) {
        log.error(`Error executing command ${commandName}:`, error);
        await this.sendErrorResponse(bot, message);
      }
    } else {
      await this.sendUnknownCommand(bot, message, commandName);
    }
  }

  /**
   * Handle ping command
   * PMAT: Single purpose function
   */
  private async handlePing(bot: Bot, message: Message, _args: string[]): Promise<void> {
    const latency = Date.now() - Number(message.timestamp);
    await sendMessage(bot, message.channelId, {
      content: `🏓 Pong! Latency: ${latency}ms`,
    });
  }

  /**
   * Handle echo command
   * PMAT: Input validation and error handling
   */
  private async handleEcho(bot: Bot, message: Message, args: string[]): Promise<void> {
    if (args.length === 0) {
      await sendMessage(bot, message.channelId, {
        content: 'Please provide text to echo.',
      });
      return;
    }

    const text = args.join(' ');
    await sendMessage(bot, message.channelId, {
      content: text,
    });
  }

  /**
   * Handle info command
   * PMAT: Null safety and proper error handling
   */
  private async handleInfo(bot: Bot, message: Message, _args: string[]): Promise<void> {
    if (!message.guildId) {
      await sendMessage(bot, message.channelId, {
        content: 'This command can only be used in a server.',
      });
      return;
    }

    // For Discordeno, we need to fetch guild information differently
    // This is a simplified version - in production you'd use the getGuild helper
    const info = `**Server Info:**
• Channel ID: ${message.channelId}
• Guild ID: ${message.guildId}
• Message ID: ${message.id}`;

    await sendMessage(bot, message.channelId, {
      content: info,
    });
  }

  /**
   * Handle help command
   * PMAT: Clear documentation
   */
  private async handleHelp(bot: Bot, message: Message, _args: string[]): Promise<void> {
    const helpText = `**Available Commands:**
• \`${this.prefix}ping\` - Check bot latency
• \`${this.prefix}echo [text]\` - Echo your message
• \`${this.prefix}info\` - Get server information
• \`${this.prefix}help\` - Show this help message`;

    await sendMessage(bot, message.channelId, {
      content: helpText,
    });
  }

  /**
   * Send error response
   * PMAT: Centralized error handling
   */
  private async sendErrorResponse(bot: Bot, message: Message): Promise<void> {
    await sendMessage(bot, message.channelId, {
      content: '❌ An error occurred while processing your command.',
    });
  }

  /**
   * Send unknown command response
   * PMAT: User-friendly error messages
   */
  private async sendUnknownCommand(
    bot: Bot,
    message: Message,
    command: string,
  ): Promise<void> {
    await sendMessage(bot, message.channelId, {
      content: `Unknown command: ${command}. Use ${this.prefix}help for available commands.`,
    });
  }

  /**
   * Start the bot
   * PMAT: Proper lifecycle management
   */
  public async start(): Promise<void> {
    log.info('🚀 Starting Discord bot...');
    await startBot(this.bot);
  }

  /**
   * Stop the bot gracefully
   * PMAT: Clean shutdown
   */
  public async stop(): Promise<void> {
    log.info('⏹️ Shutting down bot...');
    // Discordeno handles cleanup internally
  }
}

// Type definition for command handlers
type CommandHandler = (bot: Bot, message: Message, args: string[]) => Promise<void>;

// Main execution
if (import.meta.main) {
  const bot = new BasicBot();

  // Handle graceful shutdown
  const handleShutdown = async () => {
    log.info('Received shutdown signal');
    await bot.stop();
    Deno.exit(0);
  };

  Deno.addSignalListener('SIGINT', handleShutdown);
  Deno.addSignalListener('SIGTERM', handleShutdown);

  // Start the bot
  await bot.start().catch((error) => {
    log.error('Failed to start bot:', error);
    Deno.exit(1);
  });
}
