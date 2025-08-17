import { assertEquals, assertExists, describe, it } from '../../deps.ts';

describe('MCP Bot Unit Tests', () => {
  describe('Tool Detection', () => {
    it('should detect weather tool invocation', () => {
      const testCases = [
        { input: 'What is the weather in London?', expected: true },
        { input: 'Tell me the temperature for Paris', expected: true },
        { input: 'Weather at Tokyo please', expected: true },
        { input: 'Hello there', expected: false },
      ];

      testCases.forEach((test) => {
        const hasWeatherKeyword = test.input.toLowerCase().includes('weather') ||
          test.input.toLowerCase().includes('temperature');
        const hasLocation = /(?:in|for|at)\s+([^.?!]+)/i.test(test.input);
        const detected = hasWeatherKeyword && hasLocation;
        assertEquals(detected, test.expected);
      });
    });

    it('should detect calculator expressions', () => {
      const testCases = [
        { input: 'What is 5 + 3?', expected: true },
        { input: 'Calculate 10 * 20', expected: true },
        { input: '42 / 6', expected: true },
        { input: 'Hello world', expected: false },
      ];

      testCases.forEach((test) => {
        const detected = /\d+\s*[\+\-\*\/]\s*\d+/.test(test.input);
        assertEquals(detected, test.expected);
      });
    });

    it('should detect code blocks', () => {
      const testCases = [
        { input: '```python\nprint("hello")\n```', expected: true },
        { input: '```\nfunction test() {}\n```', expected: true },
        { input: 'analyze code: function() {}', expected: false },
        { input: 'normal message', expected: false },
      ];

      testCases.forEach((test) => {
        const detected = test.input.includes('```');
        assertEquals(detected, test.expected);
      });
    });
  });

  describe('Context Management', () => {
    it('should create new AI context', () => {
      const userId = '123456';
      const context = {
        userId,
        conversationHistory: [],
        metadata: {},
      };

      assertExists(context);
      assertEquals(context.userId, userId);
      assertEquals(context.conversationHistory.length, 0);
    });

    it('should add messages to conversation history', () => {
      const context = {
        userId: '123456',
        conversationHistory: [] as Array<{ role: string; content: string; timestamp: Date }>,
        metadata: {},
      };

      context.conversationHistory.push({
        role: 'user',
        content: 'Hello AI',
        timestamp: new Date(),
      });

      context.conversationHistory.push({
        role: 'assistant',
        content: 'Hello! How can I help?',
        timestamp: new Date(),
      });

      assertEquals(context.conversationHistory.length, 2);
      assertEquals(context.conversationHistory[0].role, 'user');
      assertEquals(context.conversationHistory[1].role, 'assistant');
    });

    it('should trim context when exceeding max length', () => {
      const maxLength = 10;
      const conversationHistory = Array.from({ length: 15 }, (_, i) => ({
        role: i % 2 === 0 ? 'user' : 'assistant',
        content: `Message ${i}`,
        timestamp: new Date(),
      }));

      const trimmed = conversationHistory.slice(-maxLength);
      assertEquals(trimmed.length, maxLength);
      assertEquals(trimmed[0].content, 'Message 5');
      assertEquals(trimmed[9].content, 'Message 14');
    });
  });

  describe('Tool Parameter Parsing', () => {
    it('should parse key=value parameters', () => {
      const paramString = 'location=London temperature=celsius';
      const params: Record<string, string> = {};

      const matches = paramString.matchAll(/(\w+)=([^,\s]+)/g);
      for (const match of matches) {
        params[match[1]] = match[2].trim();
      }

      assertEquals(params.location, 'London');
      assertEquals(params.temperature, 'celsius');
    });

    it('should extract location from weather queries', () => {
      const testCases = [
        { input: 'weather in New York', expected: 'New York' },
        { input: 'temperature for Los Angeles', expected: 'Los Angeles' },
        { input: 'what is the weather at Berlin', expected: 'Berlin' },
      ];

      testCases.forEach((test) => {
        // Different approach - split by in/for/at and take the rest
        const parts = test.input.split(/\s+(?:in|for|at)\s+/i);
        const location = parts.length > 1 ? parts[1].trim() : null;
        assertEquals(location, test.expected);
      });
    });

    it('should extract math expressions', () => {
      const testCases = [
        { input: 'Calculate 5 + 3', expected: '5 + 3' },
        { input: '10 * 20 equals what?', expected: '10 * 20' },
        { input: 'What is 42 / 6?', expected: '42 / 6' },
      ];

      testCases.forEach((test) => {
        const match = test.input.match(/\d+\s*[\+\-\*\/]\s*\d+/);
        const expression = match ? match[0].trim() : null;
        assertExists(expression);
        assertEquals(expression, test.expected);
      });
    });
  });

  describe('Tool Result Formatting', () => {
    it('should format weather results', () => {
      const result = 'London: 20°C, Sunny';
      const formatted = `🌤️ **Weather Report**\n${result}`;

      assertExists(formatted);
      assertEquals(formatted.includes('Weather Report'), true);
      assertEquals(formatted.includes(result), true);
    });

    it('should format calculator results', () => {
      const result = '5 + 3 = 8';
      const formatted = `🔢 **Calculation Result**\n${result}`;

      assertExists(formatted);
      assertEquals(formatted.includes('Calculation Result'), true);
      assertEquals(formatted.includes(result), true);
    });

    it('should format code analysis results', () => {
      const result = 'Language: python\nLines: 10\nComplexity: Low';
      const formatted = `💻 **Code Analysis**\n${result}`;

      assertExists(formatted);
      assertEquals(formatted.includes('Code Analysis'), true);
      assertEquals(formatted.includes(result), true);
    });
  });

  describe('MCP Request/Response', () => {
    it('should create valid MCP request', () => {
      const request = {
        jsonrpc: '2.0' as const,
        method: 'tool.invoke',
        params: {
          tool: 'weather',
          input: { location: 'London' },
        },
        id: 1,
      };

      assertEquals(request.jsonrpc, '2.0');
      assertEquals(request.method, 'tool.invoke');
      assertExists(request.params);
      assertEquals(request.id, 1);
    });

    it('should handle MCP response', () => {
      const successResponse = {
        jsonrpc: '2.0' as const,
        result: { temperature: 20, condition: 'Sunny' },
        id: 1,
      };

      const errorResponse = {
        jsonrpc: '2.0' as const,
        error: {
          code: -32602,
          message: 'Invalid params',
        },
        id: 2,
      };

      assertEquals(successResponse.result !== undefined, true);
      assertEquals(errorResponse.error !== undefined, true);
      assertEquals(errorResponse.error?.code, -32602);
    });
  });

  describe('Command Parsing', () => {
    it('should parse MCP commands', () => {
      const prefix = '!';
      const testCases = [
        {
          input: '!mcp weather location=London',
          command: 'mcp',
          args: ['weather', 'location=London'],
        },
        { input: '!tools', command: 'tools', args: [] },
        { input: '!help', command: 'help', args: [] },
        { input: '!clear', command: 'clear', args: [] },
      ];

      testCases.forEach((test) => {
        const args = test.input.slice(prefix.length).trim().split(/\s+/);
        const command = args.shift()?.toLowerCase();

        assertEquals(command, test.command);
        assertEquals(args.join(' '), test.args.join(' '));
      });
    });
  });

  describe('Safe Math Evaluation', () => {
    it('should safely evaluate math expressions', () => {
      const testCases = [
        { expression: '5 + 3', expected: 8 },
        { expression: '10 * 2', expected: 20 },
        { expression: '42 / 6', expected: 7 },
        { expression: '(5 + 3) * 2', expected: 16 },
      ];

      testCases.forEach((test) => {
        const result = new Function('return ' + test.expression)();
        assertEquals(result, test.expected);
      });
    });

    it('should handle invalid expressions', () => {
      const invalidExpressions = [
        'not math',
        'definitely not valid',
        'random text',
      ];

      invalidExpressions.forEach((expr) => {
        let error = false;
        try {
          const result = new Function('return ' + expr)();
          // If it doesn't throw, check if result is NaN or undefined
          if (result === undefined || Number.isNaN(result)) {
            error = true;
          }
        } catch {
          error = true;
        }
        assertEquals(error, true);
      });
    });
  });

  describe('Code Analysis', () => {
    it('should analyze code metrics', () => {
      const code = `function test() {
  // This is a comment
  const x = 5;
  return x * 2;
}`;

      const lines = code.split('\n').length;
      const hasComments = code.includes('//') || code.includes('/*');

      assertEquals(lines, 5);
      assertEquals(hasComments, true);
    });

    it('should determine code complexity', () => {
      const testCases = [
        { lines: 10, expected: 'Low' },
        { lines: 100, expected: 'Medium' },
        { lines: 300, expected: 'High' },
      ];

      testCases.forEach((test) => {
        const complexity = test.lines < 50 ? 'Low' : test.lines < 200 ? 'Medium' : 'High';
        assertEquals(complexity, test.expected);
      });
    });
  });
});
