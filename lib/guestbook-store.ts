import { DatabaseSync } from "node:sqlite";
import { createHmac, randomBytes } from "node:crypto";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { GuestbookError, validateMessage, type GuestMessage, type GuestPage } from "./guestbook";

const DAY = 86_400_000;
/** Server-only store. The public projection never includes rate-limit identities. */
export class GuestbookStore {
  private db: DatabaseSync;
  private salt: string;
  constructor(path: string) {
    if (path !== ":memory:") mkdirSync(dirname(path), { recursive: true });
    this.db = new DatabaseSync(path, { timeout: 1500, enableForeignKeyConstraints: true });
    this.db.exec(`
      PRAGMA journal_mode = WAL;
      PRAGMA synchronous = FULL;
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL, body TEXT NOT NULL, created_at INTEGER NOT NULL
      ) STRICT;
      CREATE TABLE IF NOT EXISTS submissions (
        request_id TEXT PRIMARY KEY,
        message_id INTEGER REFERENCES messages(id) ON DELETE SET NULL,
        client_hash TEXT NOT NULL, created_at INTEGER NOT NULL
      ) STRICT;
      CREATE INDEX IF NOT EXISTS submissions_client_time ON submissions(client_hash, created_at);
      CREATE INDEX IF NOT EXISTS submissions_time ON submissions(created_at);
      CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL) STRICT;
    `);
    this.db.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES ('rate_salt', ?)").run(randomBytes(32).toString("hex"));
    this.salt = String(this.db.prepare("SELECT value FROM settings WHERE key = 'rate_salt'").get()!.value);
  }
  list(before?: number, limit = 60): GuestPage {
    const size = Math.max(1, Math.min(60, Math.floor(limit)));
    const rows = this.db.prepare("SELECT id, name, body, created_at AS createdAt FROM messages WHERE id < ? ORDER BY id DESC LIMIT ?").all(before ?? Number.MAX_SAFE_INTEGER, size + 1) as GuestMessage[];
    const more = rows.length > size;
    const messages = rows.slice(0, size);
    return { messages, total: Number(this.db.prepare("SELECT count(*) AS count FROM messages").get()!.count), nextCursor: more ? messages.at(-1)!.id : null };
  }
  add(input: unknown, client: string, now = Date.now()) {
    const value = validateMessage(input);
    const hash = createHmac("sha256", this.salt).update(client).digest("hex");
    this.db.exec("BEGIN IMMEDIATE");
    try {
      this.db.prepare("DELETE FROM submissions WHERE created_at <= ?").run(now - DAY);
      const previous = this.db.prepare("SELECT message_id, client_hash FROM submissions WHERE request_id = ?").get(value.requestId);
      if (previous) {
        const message = this.db.prepare("SELECT id, name, body, created_at AS createdAt FROM messages WHERE id = ?").get(previous.message_id) as GuestMessage | undefined;
        if (!message || previous.client_hash !== hash || message.name !== value.name || message.body !== value.body) throw new GuestbookError("conflict", 409);
        this.db.exec("COMMIT");
        return { message, created: false };
      }
      const recent = this.db.prepare("SELECT created_at FROM submissions WHERE client_hash = ? ORDER BY created_at DESC").all(hash);
      let retry = recent.length ? Math.max(0, 30_000 - (now - Number(recent[0].created_at))) : 0;
      const tenMinutes = recent.filter(row => Number(row.created_at) > now - 600_000);
      if (tenMinutes.length >= 3) retry = Math.max(retry, Number(tenMinutes[tenMinutes.length - 1].created_at) + 600_000 - now);
      if (recent.length >= 10) retry = Math.max(retry, Number(recent[recent.length - 1].created_at) + DAY - now);
      const daily = Number(this.db.prepare("SELECT count(*) AS count FROM submissions").get()!.count);
      if (daily >= 300) retry = Math.max(retry, Number(this.db.prepare("SELECT min(created_at) AS earliest FROM submissions").get()!.earliest) + DAY - now);
      if (retry > 0) throw new GuestbookError("rate_limit", 429, Math.ceil(retry / 1000));
      const inserted = this.db.prepare("INSERT INTO messages (name, body, created_at) VALUES (?, ?, ?)").run(value.name, value.body, now);
      const id = Number(inserted.lastInsertRowid);
      this.db.prepare("INSERT INTO submissions (request_id, message_id, client_hash, created_at) VALUES (?, ?, ?, ?)").run(value.requestId, id, hash, now);
      this.db.exec("COMMIT");
      return { message: { id, name: value.name, body: value.body, createdAt: now }, created: true };
    } catch (error) {
      this.db.exec("ROLLBACK");
      throw error;
    }
  }
  close() { this.db.close(); }
}
