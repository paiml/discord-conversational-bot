// Central dependency management for Deno - Using Discordeno (Pure Deno)
// Version pinned for deterministic builds (PMAT requirement)

// Discordeno - Native Deno Discord library
export {
  type Bot,
  type Channel,
  createBot,
  type CreateBotOptions,
  type Guild,
  Intents,
  type Interaction,
  type InteractionResponse,
  type Message,
  startBot,
  type User,
} from 'https://deno.land/x/discordeno@18.0.1/mod.ts';

// Discordeno helpers
export {
  deleteMessage,
  editMessage,
  getChannel,
  getGuild,
  getMember,
  getUser,
  sendMessage,
} from 'https://deno.land/x/discordeno@18.0.1/helpers/mod.ts';

// Environment management
export { load as loadEnv } from 'https://deno.land/std@0.208.0/dotenv/mod.ts';

// Validation
export { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

// Testing utilities
export {
  assertEquals,
  assertExists,
  assertNotEquals,
  assertRejects,
  assertStrictEquals,
  assertThrows,
} from 'https://deno.land/std@0.208.0/testing/asserts.ts';

export {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  it,
} from 'https://deno.land/std@0.208.0/testing/bdd.ts';

// Async utilities
export {
  deadline,
  debounce,
  delay,
  MuxAsyncIterator,
} from 'https://deno.land/std@0.208.0/async/mod.ts';

// File system utilities
export { ensureDir, exists, walk } from 'https://deno.land/std@0.208.0/fs/mod.ts';

// Path utilities
export {
  basename,
  dirname,
  extname,
  join,
  resolve,
} from 'https://deno.land/std@0.208.0/path/mod.ts';

// Date/time utilities
export {
  format as formatDate,
  parse as parseDate,
} from 'https://deno.land/std@0.208.0/datetime/mod.ts';

// HTTP utilities
export type { ConnInfo } from 'https://deno.land/std@0.208.0/http/server.ts';

// Logging
export * as log from 'https://deno.land/std@0.208.0/log/mod.ts';
