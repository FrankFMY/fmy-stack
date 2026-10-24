import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import * as core from '@frankfmy/core';
import { EmailSchema, UserCreateSchema, validate, type } from '@frankfmy/validation';
import { Elysia } from 'elysia';
import { authPlugin, rateLimiter } from '@frankfmy/elysia-kit';
import { SignJWT } from 'jose';
import { SQL, eq } from 'drizzle-orm';
import { pgTable, text } from 'drizzle-orm/pg-core';
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { baseEntityColumns, softDeleteColumns, buildSearchFilter, buildFullTextSearch, paginate, getSoftDeleteValues, getRestoreValues, withSoftDelete } from '@frankfmy/db-utils';

const password = 'Portable-Password-2026!';
const mode = process.argv[2];
const file = process.argv[3];
if (mode === 'write') {
  await writeFile(file, await core.hashPassword(password));
} else if (mode === 'verify') {
  assert.equal(await core.verifyPassword(password, await readFile(file, 'utf8')), true);
  assert.equal(await core.verifyPassword('wrong', await readFile(file, 'utf8')), false);
} else {
  for (const path of ['dates', 'money', 'strings', 'phone', 'business', 'crypto', 'arrays', 'functions', 'types']) {
    await import(`@frankfmy/core/${path}`);
  }
  const current = await core.hashPassword(password);
  assert.match(current, /^\$pbkdf2-sha256\$600000\$[a-f0-9]{32}\$[a-f0-9]{64}$/u);
  assert.equal(core.passwordHashNeedsRehash(current), false);
  const salt = '0123456789abcdef0123456789abcdef';
  const legacy = `$sha256$${salt}$${await core.hashSHA256(salt + password)}`;
  assert.equal(await core.verifyPassword(password, legacy), true);
  assert.equal(await core.verifyPassword('wrong', legacy), false);
  assert.equal(core.passwordHashNeedsRehash(legacy), true);
  // Stored legacy bcrypt fixture, not a real user's credential.
  assert.equal(await core.verifyPassword('LegacyBcryptPassword123!', '$2b$12$DKkEsLrnJQg02Un/g60W.uvISNfLejX0xomyooHVRyEpi31KhqIdi'), true);
  assert.equal(await core.verifyPassword('wrong', '$2b$12$DKkEsLrnJQg02Un/g60W.uvISNfLejX0xomyooHVRyEpi31KhqIdi'), false);
  assert.equal(core.formatDateRU(new Date(2026, 9, 24)), '24 октября 2026');
  assert.equal(EmailSchema('reader@example.com'), 'reader@example.com');
  assert(EmailSchema('invalid') instanceof type.errors);
  assert.equal(validate(UserCreateSchema, { name: 'Reader', email: 'reader@example.com', password }).success, true);
  assert.equal(validate(UserCreateSchema, { name: '', email: 'invalid', password: 'weak' }).success, false);

  const secret = 'local-consumer-signing-fixture-only-32-bytes';
  const plugin = authPlugin({ secret });
  assert(plugin instanceof Elysia, 'plugin must use the consumer Elysia instance');
  const app = new Elysia().use(plugin)
    .get('/private', ({ user }) => user.id, { auth: true })
    .get('/admin', () => 'admin', { roles: ['admin'] });
  assert.equal((await app.handle(new Request('http://localhost/private'))).status, 401);
  for (const [role, expected] of [['member', 403], ['admin', 200]]) {
    const token = await new SignJWT({ sub: 'reader', email: 'reader@example.com', role })
      .setProtectedHeader({ alg: 'HS256' }).setExpirationTime('1h').sign(new TextEncoder().encode(secret));
    assert.equal((await app.handle(new Request('http://localhost/admin', { headers: { authorization: `Bearer ${token}` } }))).status, expected);
  }
  const limited = new Elysia().use(rateLimiter({ max: 1 })).get('/', () => 'ok');
  for (const [ip, expected] of [['198.51.100.1', 200], ['198.51.100.2', 429]]) {
    assert.equal((await limited.handle(new Request('http://localhost/', { headers: { 'x-forwarded-for': ip } }))).status, expected);
  }

  const client = new PGlite();
  try {
    const db = drizzle(client);
    const users = pgTable('consumer_users', { ...baseEntityColumns, ...softDeleteColumns, name: text('name').notNull() });
    await client.exec('CREATE TABLE consumer_users (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz, is_deleted boolean NOT NULL DEFAULT false, name text NOT NULL)');
    await db.insert(users).values([{ name: 'Alpha' }, { name: 'Beta' }, { name: 'Gamma' }]);
    const search = buildSearchFilter({ query: 'alp', columns: [users.name] });
    assert(search instanceof SQL, 'SQL helpers must use the consumer Drizzle instance');
    assert.equal((await db.select().from(users).where(search))[0].name, 'Alpha');
    assert.equal((await paginate(db.select().from(users).orderBy(users.name).$dynamic(), { page: 2, limit: 1 }))[0].name, 'Beta');
    await db.update(users).set(getSoftDeleteValues()).where(eq(users.name, 'Alpha'));
    assert.equal((await db.select().from(users).where(withSoftDelete({ deletedAtColumn: users.deletedAt }))).length, 2);
    await db.update(users).set(getRestoreValues()).where(eq(users.name, 'Alpha'));
    assert.equal((await db.select().from(users).where(withSoftDelete({ deletedAtColumn: users.deletedAt }))).length, 3);
    assert(buildFullTextSearch(users.name, 'alpha', 'english') instanceof SQL);
  } finally {
    await client.close();
  }
}
console.log(`installed runtime consumer ${mode ?? 'full'}: PASS`);
