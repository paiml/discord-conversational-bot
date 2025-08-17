/**
 * Week 3: Conversational Discord Bot using Discordeno
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
 * Interface for conversation state tracking
 * PMAT: Strong typing for state management
 */
interface ConversationState {
  userId: string;
  context: string[];
  currentTopic?: string;
  lastInteraction: Date;
  userData?: Record<string, unknown>;
}

/**
 * Interface for defining conversation flows
 * PMAT: Clear structure for flow definitions
 */
interface ConversationFlow {
  name: string;
  triggers: string[];
  states: {
    [key: string]: {
      prompt: string;
      transitions: {
        [pattern: string]: string;
      };
      action?: (state: ConversationState, input: string) => Promise<void>;
    };
  };
  initialState: string;
}

/**
 * ConversationalBot class implementing stateful conversation management
 * Following PMAT quality standards with proper error handling and state management
 */
export class ConversationalBot {
  private bot: Bot;
  private conversations: Map<string, ConversationState>;
  private flows: Map<string, ConversationFlow>;
  private readonly sessionTimeout = 5 * 60 * 1000; // 5 minutes
  private cleanupInterval?: number;

  constructor() {
    // Initialize Discordeno bot with required intents
    this.bot = createBot({
      token: env.DISCORD_TOKEN,
      intents: Intents.Guilds |
        Intents.GuildMessages |
        Intents.MessageContent |
        Intents.DirectMessages,
    });

    // Initialize state containers
    this.conversations = new Map();
    this.flows = new Map();

    this.setupEventHandlers();
    this.registerConversationFlows();
    this.startSessionCleanup();
  }

  /**
   * Setup event handlers for the bot
   * PMAT: Separation of concerns
   */
  private setupEventHandlers(): void {
    // Ready event
    this.bot.events.ready = (_bot, payload) => {
      log.info(`✅ Conversational bot logged in as ${payload.user.username}`);
    };

    // Message create event
    this.bot.events.messageCreate = async (bot, message) => {
      await this.handleMessage(bot, message);
    };
  }

  /**
   * Register conversation flows
   * PMAT: Modular flow registration
   */
  private registerConversationFlows(): void {
    const onboardingFlow = this.createOnboardingFlow();
    this.flows.set('onboarding', onboardingFlow);
  }

  /**
   * Create the onboarding conversation flow
   * PMAT: Single Responsibility - Flow creation
   */
  private createOnboardingFlow(): ConversationFlow {
    return {
      name: 'onboarding',
      triggers: ['hello', 'hi', 'start', 'help'],
      states: {
        greeting: {
          prompt: "👋 Hello! I'm your conversational assistant. What's your name?",
          transitions: {
            '.*': 'askPurpose',
          },
          action: async (state, input) => {
            state.userData = { name: input.trim() };
          },
        },
        askPurpose: {
          prompt: `Nice to meet you, {name}! What brings you here today?
1. Learn about Discord bots
2. Get help with coding
3. Just chatting`,
          transitions: {
            '(1|learn|discord|bot)': 'botLearning',
            '(2|help|coding|code)': 'codingHelp',
            '(3|chat|talk)': 'casualChat',
            '.*': 'clarifyPurpose',
          },
        },
        clarifyPurpose: {
          prompt:
            "I didn't quite understand. Could you tell me which option you'd prefer? (1, 2, or 3)",
          transitions: {
            '(1|learn|discord|bot)': 'botLearning',
            '(2|help|coding|code)': 'codingHelp',
            '(3|chat|talk)': 'casualChat',
            '.*': 'askPurpose',
          },
        },
        botLearning: {
          prompt: `Great! Discord bots are powerful tools. What aspect interests you most?
• Commands and interactions
• Event handling
• API integration`,
          transitions: {
            '(command|interaction)': 'commandsInfo',
            '(event|handling)': 'eventsInfo',
            '(api|integration)': 'apiInfo',
            '.*': 'complete',
          },
        },
        codingHelp: {
          prompt: "I'd be happy to help with coding! What language are you working with?",
          transitions: {
            '(javascript|js|typescript|ts)': 'jsHelp',
            '(python|py)': 'pythonHelp',
            '(deno|rust)': 'denoRustHelp',
            '.*': 'generalHelp',
          },
        },
        casualChat: {
          prompt: "That's nice! What would you like to talk about?",
          transitions: {
            '.*': 'complete',
          },
        },
        commandsInfo: {
          prompt:
            'Commands are the primary way users interact with bots. You can use prefix commands (!help) or slash commands (/help). Would you like to see an example?',
          transitions: {
            '(yes|sure|ok|yeah)': 'showExample',
            '(no|nope)': 'complete',
            '.*': 'complete',
          },
        },
        eventsInfo: {
          prompt:
            'Event handling allows your bot to respond to various Discord events like messages, reactions, and member joins. Interested in learning more?',
          transitions: {
            '(yes|sure|ok|yeah)': 'showExample',
            '(no|nope)': 'complete',
            '.*': 'complete',
          },
        },
        apiInfo: {
          prompt:
            'The Discord API provides REST endpoints and WebSocket connections for real-time communication. Would you like documentation links?',
          transitions: {
            '(yes|sure|ok|yeah)': 'provideLinks',
            '(no|nope)': 'complete',
            '.*': 'complete',
          },
        },
        showExample: {
          prompt: `Here's a simple Deno example:
\`\`\`typescript
bot.events.messageCreate = (bot, message) => {
  if (message.content === '!ping') {
    sendMessage(bot, message.channelId, { content: 'Pong!' });
  }
};
\`\`\`
Anything else you'd like to know?`,
          transitions: {
            '.*': 'complete',
          },
        },
        provideLinks: {
          prompt: `Check out these resources:
• Discordeno: https://deno.land/x/discordeno
• Discord API Docs: https://discord.com/developers/docs
• Deno Deploy: https://deno.com/deploy

Is there anything specific you need help with?`,
          transitions: {
            '.*': 'complete',
          },
        },
        jsHelp: {
          prompt:
            'JavaScript/TypeScript works great with Deno! Are you using Discordeno for Discord?',
          transitions: {
            '.*': 'complete',
          },
        },
        pythonHelp: {
          prompt: 'Python is great for Discord bots! Are you familiar with discord.py?',
          transitions: {
            '.*': 'complete',
          },
        },
        denoRustHelp: {
          prompt:
            'Excellent choice! Deno and Rust are both modern and performant. Which one are you focusing on?',
          transitions: {
            '.*': 'complete',
          },
        },
        generalHelp: {
          prompt:
            'I can help with various programming concepts. What specific challenge are you facing?',
          transitions: {
            '.*': 'complete',
          },
        },
        complete: {
          prompt:
            "Thank you for the conversation! Feel free to say 'hi' again anytime you need help. 😊",
          transitions: {},
        },
      },
      initialState: 'greeting',
    };
  }

  /**
   * Handle incoming messages
   * PMAT: Cyclomatic complexity kept low through delegation
   */
  private async handleMessage(bot: Bot, message: Message): Promise<void> {
    // Ignore bot messages
    if (message.isFromBot) return;

    const userId = message.authorId.toString();
    const state = this.conversations.get(userId);

    if (!state || this.isSessionExpired(state)) {
      await this.handleNewConversation(bot, message, userId);
    } else {
      await this.handleExistingConversation(bot, message, state);
    }
  }

  /**
   * Handle new conversation initiation
   * PMAT: Single responsibility function
   */
  private async handleNewConversation(
    bot: Bot,
    message: Message,
    userId: string,
  ): Promise<void> {
    const flow = this.detectFlow(message.content);
    if (flow) {
      const state = this.createConversationState(userId, flow.name);
      this.conversations.set(userId, state);
      await this.processConversation(bot, message, state, flow);
    }
  }

  /**
   * Handle existing conversation continuation
   * PMAT: Single responsibility function
   */
  private async handleExistingConversation(
    bot: Bot,
    message: Message,
    state: ConversationState,
  ): Promise<void> {
    const flowName = state.currentTopic;
    if (flowName) {
      const flow = this.flows.get(flowName);
      if (flow) {
        await this.processConversation(bot, message, state, flow);
      }
    }
  }

  /**
   * Detect which conversation flow to use
   * PMAT: Clear flow detection logic
   */
  private detectFlow(content: string): ConversationFlow | undefined {
    const normalizedContent = content.toLowerCase().trim();

    for (const flow of this.flows.values()) {
      if (flow.triggers.some((trigger) => normalizedContent.includes(trigger))) {
        return flow;
      }
    }

    return undefined;
  }

  /**
   * Create a new conversation state
   * PMAT: Factory method for state creation
   */
  private createConversationState(userId: string, topic: string): ConversationState {
    return {
      userId,
      context: [],
      currentTopic: topic,
      lastInteraction: new Date(),
      userData: {},
    };
  }

  /**
   * Process conversation flow
   * PMAT: Core conversation logic with low complexity
   */
  private async processConversation(
    bot: Bot,
    message: Message,
    state: ConversationState,
    flow: ConversationFlow,
  ): Promise<void> {
    state.lastInteraction = new Date();

    const currentStateName = state.context[state.context.length - 1] || flow.initialState;
    const currentState = flow.states[currentStateName];

    if (!currentState) {
      await this.handleConfusedState(bot, message, state);
      return;
    }

    // Handle initial state
    if (state.context.length === 0) {
      await this.handleInitialState(bot, message, state, flow, currentState);
      return;
    }

    // Process user input and transition
    await this.processUserInput(bot, message, state, flow, currentState);
  }

  /**
   * Handle confused state when flow is broken
   * PMAT: Error recovery
   */
  private async handleConfusedState(
    bot: Bot,
    message: Message,
    state: ConversationState,
  ): Promise<void> {
    await sendMessage(bot, message.channelId, {
      content: "I'm a bit confused. Let's start over!",
    });
    this.conversations.delete(state.userId);
  }

  /**
   * Handle initial state of conversation
   * PMAT: Single responsibility
   */
  private async handleInitialState(
    bot: Bot,
    message: Message,
    state: ConversationState,
    flow: ConversationFlow,
    currentState: any,
  ): Promise<void> {
    state.context.push(flow.initialState);
    const prompt = this.interpolatePrompt(currentState.prompt, state);
    await sendMessage(bot, message.channelId, { content: prompt });
  }

  /**
   * Process user input and determine next state
   * PMAT: Core transition logic
   */
  private async processUserInput(
    bot: Bot,
    message: Message,
    state: ConversationState,
    flow: ConversationFlow,
    currentState: any,
  ): Promise<void> {
    const userInput = message.content.toLowerCase().trim();

    // Execute action if defined
    if (currentState.action) {
      await currentState.action(state, message.content);
    }

    // Find next state
    const nextStateName = this.findNextState(userInput, currentState.transitions);

    if (nextStateName) {
      await this.transitionToNextState(bot, message, state, flow, nextStateName);
    } else {
      await this.handleUnknownInput(bot, message);
    }
  }

  /**
   * Find next state based on user input
   * PMAT: Pattern matching logic
   */
  private findNextState(
    userInput: string,
    transitions: Record<string, string>,
  ): string | undefined {
    for (const [pattern, targetState] of Object.entries(transitions)) {
      const regex = new RegExp(pattern, 'i');
      if (regex.test(userInput)) {
        return targetState;
      }
    }
    return transitions['.*']; // Default transition
  }

  /**
   * Transition to next state
   * PMAT: State transition handling
   */
  private async transitionToNextState(
    bot: Bot,
    message: Message,
    state: ConversationState,
    flow: ConversationFlow,
    nextStateName: string,
  ): Promise<void> {
    state.context.push(nextStateName);
    const nextState = flow.states[nextStateName];

    if (nextState) {
      const prompt = this.interpolatePrompt(nextState.prompt, state);
      await sendMessage(bot, message.channelId, { content: prompt });

      if (nextStateName === 'complete') {
        this.conversations.delete(state.userId);
      }
    }
  }

  /**
   * Handle unknown user input
   * PMAT: Error handling
   */
  private async handleUnknownInput(bot: Bot, message: Message): Promise<void> {
    await sendMessage(bot, message.channelId, {
      content: "I didn't understand that. Could you rephrase?",
    });
  }

  /**
   * Interpolate placeholders in prompts
   * PMAT: Template processing
   */
  private interpolatePrompt(prompt: string, state: ConversationState): string {
    let result = prompt;

    if (state.userData) {
      for (const [key, value] of Object.entries(state.userData)) {
        const placeholder = `{${key}}`;
        result = result.replace(placeholder, String(value));
      }
    }

    return result;
  }

  /**
   * Check if session has expired
   * PMAT: Session validation
   */
  private isSessionExpired(state: ConversationState): boolean {
    return Date.now() - state.lastInteraction.getTime() > this.sessionTimeout;
  }

  /**
   * Start periodic cleanup of expired sessions
   * PMAT: Resource management
   */
  private startSessionCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredSessions();
    }, 60000); // Check every minute
  }

  /**
   * Clean up expired sessions
   * PMAT: Memory management
   */
  private cleanupExpiredSessions(): void {
    const now = Date.now();
    for (const [userId, state] of this.conversations.entries()) {
      if (now - state.lastInteraction.getTime() > this.sessionTimeout) {
        this.conversations.delete(userId);
        log.debug(`Cleaned up expired session for user ${userId}`);
      }
    }
  }

  /**
   * Start the bot
   * PMAT: Proper lifecycle management
   */
  public async start(): Promise<void> {
    log.info('🚀 Starting conversational bot...');
    await startBot(this.bot);
  }

  /**
   * Stop the bot gracefully
   * PMAT: Clean shutdown
   */
  public async stop(): Promise<void> {
    log.info('⏹️ Shutting down conversational bot...');
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    // Discordeno handles cleanup internally
  }
}

// Main execution
if (import.meta.main) {
  const bot = new ConversationalBot();

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
    log.error('Failed to start conversational bot:', error);
    Deno.exit(1);
  });
}
