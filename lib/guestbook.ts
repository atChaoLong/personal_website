export const MESSAGE_LIMIT = 280;
export const NAME_LIMIT = 24;
export type GuestMessage = { id: number; name: string; body: string; createdAt: number };
export type GuestPage = { messages: GuestMessage[]; total: number; nextCursor: number | null };
export const characterCount = (value: string) => Array.from(value).length;
export function meteorLength(body: string, width: number) {
  return 100 + Math.min(1, characterCount(body) / MESSAGE_LIMIT) * (Math.min(390, width * .7) - 100);
}
// Preserve occupied lanes while keeping every visible message unique.
export function arrangeMeteorLanes(messages: GuestMessage[], previous: GuestMessage[], limit: number) {
  if (!messages.length) return [];
  const available = new Map(messages.map(message => [message.id, message]));
  const next: GuestMessage[] = [];
  for (let lane = 0; lane < Math.min(limit, available.size); lane++) {
    const existing = available.get(previous[lane]?.id);
    const unused = (message: GuestMessage) => !next.some(item => item.id === message.id);
    const candidate = existing && unused(existing) ? existing : messages.find(unused);
    if (candidate) next.push(candidate);
  }
  return next;
}
export type GuestErrorCode = "invalid" | "too_large" | "origin" | "rate_limit" | "conflict" | "unavailable";
export class GuestbookError extends Error {
  code: GuestErrorCode;
  status: number;
  retryAfter: number;
  constructor(code: GuestErrorCode, status = 400, retryAfter = 0) {
    super(code); this.code = code; this.status = status; this.retryAfter = retryAfter;
  }
}
export function validateMessage(input: unknown) {
  if (!input || typeof input !== "object") throw new GuestbookError("invalid");
  const value = input as Record<string, unknown>;
  if (typeof value.name !== "string" || typeof value.body !== "string" || typeof value.requestId !== "string" || (value.website !== undefined && value.website !== "")) throw new GuestbookError("invalid");
  const name = value.name.normalize("NFC").trim();
  const body = value.body.normalize("NFC").replace(/\r\n?/g, "\n").trim();
  if (!body || characterCount(body) > MESSAGE_LIMIT || characterCount(name) > NAME_LIMIT || /[\u0000-\u001f\u007f]/u.test(name) || /[\u0000-\u0008\u000b-\u001f\u007f]/u.test(body) || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value.requestId)) throw new GuestbookError("invalid");
  return { name, body, requestId: value.requestId.toLowerCase() };
}
