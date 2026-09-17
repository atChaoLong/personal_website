// Run as the server/container owner. No public administration endpoint or token.
import { DatabaseSync, backup } from 'node:sqlite';
import { existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const [command, argument] = process.argv.slice(2);
const file = resolve(process.env.GUESTBOOK_DB_PATH ?? 'data/guestbook.sqlite');
if (!['list', 'delete', 'backup'].includes(command)) throw new Error('Usage: node ops/guestbook.mjs list | delete ID | backup PATH');
if (!existsSync(file)) throw new Error('No guestbook database yet. Open the guestbook first.');
const db = new DatabaseSync(file, { readOnly: command !== 'delete', timeout: 3000, enableForeignKeyConstraints: true });
try {
  if (command === 'list') {
    console.log(JSON.stringify(db.prepare('SELECT id, name, body, created_at AS createdAt FROM messages ORDER BY id DESC LIMIT 100').all(), null, 2));
  } else if (command === 'delete') {
    if (!/^[1-9]\d*$/.test(argument ?? '') || !Number.isSafeInteger(Number(argument))) throw new Error('Provide a valid numeric message ID.');
    const result = db.prepare('DELETE FROM messages WHERE id = ?').run(Number(argument));
    console.log(`Deleted ${result.changes} message(s).`);
  } else {
    if (!argument) throw new Error('Provide a new backup filename.');
    const target = resolve(argument);
    if (target === file || existsSync(target)) throw new Error('Backup target must be a new file.');
    mkdirSync(dirname(target), { recursive: true });
    await backup(db, target);
    console.log('SQLite backup completed.');
  }
} finally { db.close(); }
