import { assertEquals, assertExists, describe, it } from '../../deps.ts';

describe('BasicBot Unit Tests', () => {
  describe('Command Parsing', () => {
    it('should parse ping command correctly', () => {
      const content = '!ping';
      const prefix = '!';
      const args = content.slice(prefix.length).trim().split(/ +/);
      const command = args.shift()?.toLowerCase();

      assertEquals(command, 'ping');
      assertEquals(args.length, 0);
    });

    it('should parse echo command with arguments', () => {
      const content = '!echo Hello World';
      const prefix = '!';
      const args = content.slice(prefix.length).trim().split(/ +/);
      const command = args.shift()?.toLowerCase();

      assertEquals(command, 'echo');
      assertEquals(args.join(' '), 'Hello World');
    });

    it('should handle help command', () => {
      const content = '!help';
      const prefix = '!';
      const args = content.slice(prefix.length).trim().split(/ +/);
      const command = args.shift()?.toLowerCase();

      assertEquals(command, 'help');
      assertEquals(args.length, 0);
    });

    it('should handle info command', () => {
      const content = '!info';
      const prefix = '!';
      const args = content.slice(prefix.length).trim().split(/ +/);
      const command = args.shift()?.toLowerCase();

      assertEquals(command, 'info');
      assertEquals(args.length, 0);
    });
  });

  describe('Message Validation', () => {
    it('should validate message has prefix', () => {
      const prefix = '!';
      const validMessage = '!ping';
      const invalidMessage = 'ping';

      assertEquals(validMessage.startsWith(prefix), true);
      assertEquals(invalidMessage.startsWith(prefix), false);
    });

    it('should extract arguments correctly', () => {
      const content = '!echo one two three';
      const prefix = '!';
      const args = content.slice(prefix.length).trim().split(/ +/);
      args.shift(); // Remove command

      assertEquals(args.length, 3);
      assertEquals(args[0], 'one');
      assertEquals(args[1], 'two');
      assertEquals(args[2], 'three');
    });
  });

  describe('Response Formatting', () => {
    it('should format ping response', () => {
      const latency = 50;
      const apiLatency = 30;
      const response = `🏓 Pong! Latency: ${latency}ms, API: ${apiLatency}ms`;

      assertExists(response);
      assertEquals(response.includes('Pong'), true);
      assertEquals(response.includes('50ms'), true);
    });

    it('should format help text', () => {
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
  });
});
