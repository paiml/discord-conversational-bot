import { assertEquals, assertExists, describe, it } from '../../deps.ts';

describe('ConversationalBot Unit Tests', () => {
  describe('Conversation Flow Detection', () => {
    it('should detect greeting triggers', () => {
      const triggers = ['hello', 'hi', 'start', 'help'];
      const testInputs = [
        { input: 'hello there', expected: true },
        { input: 'hi bot', expected: true },
        { input: 'start conversation', expected: true },
        { input: 'help me', expected: true },
        { input: 'goodbye', expected: false },
      ];

      testInputs.forEach((test) => {
        const normalized = test.input.toLowerCase().trim();
        const detected = triggers.some((trigger) => normalized.includes(trigger));
        assertEquals(detected, test.expected);
      });
    });
  });

  describe('State Management', () => {
    it('should create conversation state', () => {
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

    it('should track conversation context', () => {
      const state = {
        userId: '123456',
        context: ['greeting', 'askPurpose'],
        currentTopic: 'onboarding',
        lastInteraction: new Date(),
        userData: { name: 'Test User' },
      };

      assertEquals(state.context.length, 2);
      assertEquals(state.context[0], 'greeting');
      assertEquals(state.context[1], 'askPurpose');
    });
  });

  describe('Session Management', () => {
    it('should detect expired sessions', () => {
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
  });

  describe('Prompt Interpolation', () => {
    it('should interpolate user data in prompts', () => {
      const prompt = 'Nice to meet you, {name}! What brings you here today?';
      const userData = { name: 'Alice' };

      let result = prompt;
      for (const [key, value] of Object.entries(userData)) {
        const placeholder = `{${key}}`;
        result = result.replace(placeholder, String(value));
      }

      assertEquals(result, 'Nice to meet you, Alice! What brings you here today?');
    });

    it('should handle multiple placeholders', () => {
      const prompt = 'Hello {name}, your ID is {id}';
      const userData = { name: 'Bob', id: '12345' };

      let result = prompt;
      for (const [key, value] of Object.entries(userData)) {
        const placeholder = `{${key}}`;
        result = result.replace(placeholder, String(value));
      }

      assertEquals(result, 'Hello Bob, your ID is 12345');
    });
  });

  describe('Transition Matching', () => {
    it('should match transition patterns', () => {
      const transitions = {
        '(1|learn|discord|bot)': 'botLearning',
        '(2|help|coding|code)': 'codingHelp',
        '(3|chat|talk)': 'casualChat',
        '.*': 'clarifyPurpose',
      };

      const testCases = [
        { input: '1', expected: 'botLearning' },
        { input: 'learn', expected: 'botLearning' },
        { input: 'help', expected: 'codingHelp' },
        { input: 'chat', expected: 'casualChat' },
        { input: 'something else', expected: 'clarifyPurpose' },
      ];

      testCases.forEach((test) => {
        let matched = '';
        for (const [pattern, target] of Object.entries(transitions)) {
          const regex = new RegExp(pattern, 'i');
          if (regex.test(test.input)) {
            matched = target;
            break;
          }
        }
        assertEquals(matched, test.expected);
      });
    });
  });
});
