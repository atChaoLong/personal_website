import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { stripTypeScriptTypes } from 'node:module';
import { randomUUID } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';

const moduleURL = (name, imports = {}) => {
  let source = stripTypeScriptTypes(readFileSync(new URL(`../lib/${name}.ts`, import.meta.url), 'utf8'));
  for (const [path, url] of Object.entries(imports)) source = source.replaceAll(`"${path}"`, JSON.stringify(url));
  return `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;
};
const common = moduleURL('guestbook');
const { validateMessage, meteorLength } = await import(common);
const { GuestbookStore } = await import(moduleURL('guestbook-store', { './guestbook': common }));
const { guestbookHandlers } = await import(moduleURL('guestbook-http', { './guestbook': common }));
const payload = (body = 'A little light.', name = 'Traveler') => ({ body, name, requestId: randomUUID(), website: '' });
const fixture = () => { const directory = mkdtempSync(join(tmpdir(), 'guestbook-test-')); return { directory, path: join(directory, 'messages.sqlite') }; };

test('unicode limits, whitespace, empty names and invalid submissions are checked on the server', () => {
  assert.equal(validateMessage(payload('  hello\r\nworld  ', '')).body, 'hello\nworld');
  assert.equal(validateMessage(payload('✨'.repeat(280))).body.length, 280);
  assert.equal(validateMessage(payload('🌌'.repeat(280))).body.length, 560);
  for (const input of [payload(' '), payload('🌌'.repeat(281)), payload('hello', 'n'.repeat(25)), payload('a\0b'), { ...payload(), website: 'spam' }, { ...payload(), requestId: 'bad' }, null, []]) assert.throws(() => validateMessage(input));
  for (const width of [280, 1200]) assert.ok(meteorLength('a'.repeat(250), width) > meteorLength('a'.repeat(20), width));
});

test('messages, idempotency and rate limits survive closing and reopening SQLite', () => {
  const f = fixture(); let db = new GuestbookStore(f.path);
  try {
    const input = payload("<script>alert('x')</script>'); DROP TABLE messages; --", '旅人');
    const first = db.add(input, 'client-a', 1_000_000);
    db.close(); db = new GuestbookStore(f.path);
    const repeated = db.add(input, 'client-a', 1_000_001);
    assert.equal(repeated.created, false); assert.deepEqual({ ...repeated.message }, first.message);
    assert.equal(db.list().total, 1); assert.equal(db.list().messages[0].body, input.body);
    assert.deepEqual(Object.keys(db.list().messages[0]).sort(), ['body', 'createdAt', 'id', 'name']);
    assert.throws(() => db.add(payload(), 'client-a', 1_000_010), e => e.code === 'rate_limit' && e.retryAfter === 30);
    assert.throws(() => db.add({ ...input, body: 'different' }, 'client-a', 1_100_000), e => e.code === 'conflict');
    assert.throws(() => db.add(input, 'client-b', 1_100_000), e => e.code === 'conflict');
    assert.equal(db.add(payload(), 'client-a', 1_030_000).created, true);
    db.add(payload(), 'client-a', 1_060_000);
    assert.throws(() => db.add(payload(), 'client-a', 1_090_000), e => e.code === 'rate_limit' && e.retryAfter === 510);
    assert.equal(db.add(payload(), 'client-a', 1_600_001).created, true);
    assert.equal(db.list().total, 4);
  } finally { db.close(); rmSync(f.directory, { recursive: true }); }
});

test('cursor pagination has no omissions or repeats and public reads contain no rate-limit identities', () => {
  const db = new GuestbookStore(':memory:');
  try {
    for (let i = 0; i < 135; i++) db.add(payload(`Message ${i}`), `client-${i}`, 1_000_000 + i);
    const all = []; let cursor;
    do { const page = db.list(cursor); assert.equal(page.total, 135); all.push(...page.messages); cursor = page.nextCursor; } while (cursor);
    assert.equal(all.length, 135); assert.equal(new Set(all.map(m => m.id)).size, 135);
    assert.equal(all[0].body, 'Message 134'); assert.equal(all.at(-1).body, 'Message 0');
    assert.ok(!JSON.stringify(all).includes('client-'));
  } finally { db.close(); }
});

test('daily caps are persistent and expired private submission metadata is pruned', () => {
  const f = fixture(), db = new GuestbookStore(f.path);
  try {
    for (let i = 0; i < 10; i++) db.add(payload(), 'same-client', 1_000_000 + i * 610_000);
    assert.throws(() => db.add(payload(), 'same-client', 1_000_000 + 10 * 610_000), e => e.code === 'rate_limit');
    db.add(payload(), 'same-client', 1_000_000 + 86_400_001);
    const inspection = new DatabaseSync(f.path);
    assert.equal(inspection.prepare('SELECT count(*) AS n FROM submissions').get().n, 10);
    assert.equal(inspection.prepare('SELECT count(*) AS n FROM messages').get().n, 11);
    assert.ok(!JSON.stringify(inspection.prepare('SELECT * FROM submissions').all()).includes('same-client'));
    inspection.close();
  } finally { db.close(); rmSync(f.directory, { recursive: true }); }
  const limit = new GuestbookStore(':memory:');
  try {
    for (let i = 0; i < 300; i++) limit.add(payload(), `visitor-${i}`, 1_000_000);
    assert.throws(() => limit.add(payload(), 'visitor-extra', 1_000_000), e => e.code === 'rate_limit');
  } finally { limit.close(); }
});

test('HTTP rejects cross-site, oversized streamed bodies, malformed JSON and untrusted forwarded identities', async () => {
  const db = new GuestbookStore(':memory:'); const handler = guestbookHandlers(() => db);
  const post = (value, extra = {}) => new Request('https://portfolio.example/api/guestbook', { method: 'POST', headers: { Origin: 'https://portfolio.example', 'Content-Type': 'application/json', ...extra }, body: typeof value === 'string' ? value : JSON.stringify(value) });
  try {
    assert.equal((await handler.POST(post(payload(), { Origin: 'https://other.example' }))).status, 403);
    assert.equal((await handler.POST(post(payload(), { 'Sec-Fetch-Site': 'cross-site' }))).status, 403);
    assert.equal((await handler.POST(post('{'))).status, 400);
    assert.equal((await handler.POST(post(payload(), { 'Content-Type': 'text/plain' }))).status, 415);
    assert.equal((await handler.POST(post('x'.repeat(5000)))).status, 413);
    const stream = new ReadableStream({ start(c) { c.enqueue(new Uint8Array(3000)); c.enqueue(new Uint8Array(3000)); c.close(); } });
    assert.equal((await handler.POST(new Request('https://portfolio.example/api/guestbook', { method: 'POST', duplex: 'half', headers: { Origin: 'https://portfolio.example', 'Content-Type': 'application/json' }, body: stream }))).status, 413);
    const input = payload(); assert.equal((await handler.POST(post(input, { 'X-Real-IP': '192.0.2.1' }))).status, 201);
    assert.equal((await handler.POST(post(input, { 'X-Real-IP': '192.0.2.2' }))).status, 200);
    const rate = await handler.POST(post(payload(), { 'X-Real-IP': '192.0.2.3', 'X-Forwarded-For': '198.51.100.1' }));
    assert.equal(rate.status, 429); assert.ok(Number(rate.headers.get('Retry-After')) > 0);
    assert.equal(handler.GET(new Request('https://portfolio.example/api/guestbook?before=no')).status, 400);
    const response = handler.GET(new Request('https://portfolio.example/api/guestbook'));
    assert.equal(response.headers.get('Cache-Control'), 'no-store'); assert.equal((await response.json()).total, 1);
  } finally { db.close(); }
});

test('owner tools back up a live WAL database and remove messages without making retries repost them', () => {
  const f = fixture(), db = new GuestbookStore(f.path);
  const input = payload('Keep this in the backup.');
  try {
    const saved = db.add(input, 'client-a');
    const script = new URL('../ops/guestbook.mjs', import.meta.url);
    const env = { ...process.env, GUESTBOOK_DB_PATH: f.path };
    const backup = join(f.directory, 'copy.sqlite');
    execFileSync(process.execPath, [fileURLToPath(script), 'backup', backup], { env, stdio: 'pipe' });
    const restored = new GuestbookStore(backup);
    assert.equal(restored.list().messages[0].body, input.body); restored.close();
    execFileSync(process.execPath, [fileURLToPath(script), 'delete', String(saved.message.id)], { env, stdio: 'pipe' });
    assert.equal(db.list().total, 0);
    assert.throws(() => db.add(input, 'client-a'), e => e.code === 'conflict');
  } finally { db.close(); rmSync(f.directory, { recursive: true }); }
});
