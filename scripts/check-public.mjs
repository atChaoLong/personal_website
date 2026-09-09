import { execFileSync } from 'node:child_process';

const git = (...args) => execFileSync('git', args, { maxBuffer: 128 * 1024 * 1024 });
const historical = process.argv.includes('--history');
const entries = historical
  ? git('rev-list', '--objects', '--branches', '--remotes', '--tags').toString().trim().split('\n').map(line => {
      const split = line.indexOf(' ');
      return [split < 0 ? line : line.slice(0, split), split < 0 ? '(commit/tree)' : line.slice(split + 1)];
    })
  : git('ls-files', '-z').toString().split('\0').filter(Boolean).map(path => [null, path]);
const { readFileSync } = await import('node:fs');
const rules = [
  ['private key', /-----BEGIN (?:RSA |EC |OPENSSH |ENCRYPTED )?PRIVATE KEY-----/],
  ['GitHub token', /\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{40,})\b/],
  ['cloud access key', /\b(?:AKIA[A-Z0-9]{16}|LTAI[A-Za-z0-9]{12,})\b/],
  ['API token', /\bsk-(?:proj-)?[A-Za-z0-9_-]{32,}\b/],
];
let failures = 0;
function check(path, content, object = '') {
  const label = object ? `${object.slice(0, 12)}:${path}` : path;
  if (/(^|\/)(?:\.env(?:\..+)?|[^/]+\.(?:key|pem|pfx|p12))$/.test(path) && !path.endsWith('.env.example')) {
    console.error(`${label}: environment/certificate file`); failures++;
  }
  for (const [name, pattern] of rules) if (pattern.test(content)) {
    console.error(`${label}: ${name}`); failures++;
  }
  if (/^(?:DEPLOY|README|deploy\/)/.test(path)) {
    if (/\/root\/[A-Za-z0-9_-]+|\b(?:[1-9]\d{0,2}\.){3}\d{1,3}\b/.test(content.replaceAll('127.0.0.1', '').replaceAll('127.0.0.11', ''))) {
      console.error(`${label}: host address or administrator path`); failures++;
    }
  }
}
if (historical) {
  const output = execFileSync('git', ['cat-file', '--batch'], { input: entries.map(([id]) => id).join('\n') + '\n', maxBuffer: 128 * 1024 * 1024 });
  let offset = 0;
  for (const [id, path] of entries) {
    const end = output.indexOf(10, offset);
    const [, type, length] = output.subarray(offset, end).toString().split(' ');
    offset = end + 1;
    const content = output.subarray(offset, offset + Number(length));
    offset += Number(length) + 1;
    if (type === 'blob') check(path, content.toString(), id);
  }
} else {
  for (const [, path] of entries) check(path, readFileSync(path, 'utf8'));
}
console.log(`Checked ${entries.length} ${historical ? 'Git objects' : 'tracked files'}; findings: ${failures}. Values are never printed.`);
process.exitCode = failures ? 1 : 0;
