import { assertEquals, assertExists } from 'https://deno.land/std@0.208.0/testing/asserts.ts';

Deno.test('Command Parsing - ping', () => {
  const content = '!ping';
  const prefix = '!';
  const args = content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift()?.toLowerCase();

  assertEquals(command, 'ping');
  assertEquals(args.length, 0);
});

Deno.test('Command Parsing - echo with args', () => {
  const content = '!echo Hello World';
  const prefix = '!';
  const args = content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift()?.toLowerCase();

  assertEquals(command, 'echo');
  assertEquals(args.join(' '), 'Hello World');
});

Deno.test('Command Parsing - help', () => {
  const content = '!help';
  const prefix = '!';
  const args = content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift()?.toLowerCase();

  assertEquals(command, 'help');
  assertEquals(args.length, 0);
});

Deno.test('Message Validation - prefix check', () => {
  const prefix = '!';
  const validMessage = '!ping';
  const invalidMessage = 'ping';

  assertEquals(validMessage.startsWith(prefix), true);
  assertEquals(invalidMessage.startsWith(prefix), false);
});

Deno.test('Conversation Flow - greeting triggers', () => {
  const triggers = ['hello', 'hi', 'start', 'help'];
  const testInputs = [
    { input: 'hello there', expected: true },
    { input: 'hi bot', expected: true },
    { input: 'goodbye', expected: false },
  ];

  testInputs.forEach((test) => {
    const normalized = test.input.toLowerCase().trim();
    const detected = triggers.some((trigger) => normalized.includes(trigger));
    assertEquals(detected, test.expected);
  });
});

Deno.test('State Management - create state', () => {
  const state = {
    userId: '123456',
    context: [],
    currentTopic: 'onboarding',
    lastInteraction: new Date(),
    userData: {},
  };

  assertExists(state);
  assertEquals(state.userId, '123456');
  assertEquals(state.currentTopic, 'onboarding');
  assertEquals(state.context.length, 0);
});

Deno.test('Session Expiry Check', () => {
  const sessionTimeout = 5 * 60 * 1000; // 5 minutes
  const now = Date.now();

  const expiredState = {
    lastInteraction: new Date(now - 10 * 60 * 1000), // 10 minutes ago
  };

  const validState = {
    lastInteraction: new Date(now - 2 * 60 * 1000), // 2 minutes ago
  };

  const isExpired = (state: { lastInteraction: Date }) =>
    now - state.lastInteraction.getTime() > sessionTimeout;

  assertEquals(isExpired(expiredState), true);
  assertEquals(isExpired(validState), false);
});

Deno.test('Prompt Interpolation', () => {
  const prompt = 'Nice to meet you, {name}!';
  const userData = { name: 'Alice' };

  let result = prompt;
  for (const [key, value] of Object.entries(userData)) {
    const placeholder = `{${key}}`;
    result = result.replace(placeholder, String(value));
  }

  assertEquals(result, 'Nice to meet you, Alice!');
});

Deno.test('Response Formatting', () => {
  const latency = 50;
  const apiLatency = 30;
  const response = `🏓 Pong! Latency: ${latency}ms, API: ${apiLatency}ms`;

  assertExists(response);
  assertEquals(response.includes('Pong'), true);
  assertEquals(response.includes('50ms'), true);
});

Deno.test('Help Text Formatting', () => {
  const helpText = `**Available Commands:**
• \`!ping\` - Check bot latency
• \`!echo [text]\` - Echo your message
• \`!info\` - Get server information
• \`!help\` - Show this help message`;

  assertExists(helpText);
  assertEquals(helpText.includes('!ping'), true);
  assertEquals(helpText.includes('!echo'), true);
  assertEquals(helpText.includes('!info'), true);
  assertEquals(helpText.includes('!help'), true);
});
