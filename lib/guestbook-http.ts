import { isIP } from "node:net";
import { GuestbookError } from "./guestbook";
import type { GuestbookStore } from "./guestbook-store";

const headers = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };
async function readBody(request: Request) {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) throw new GuestbookError("invalid", 415);
  if (Number(request.headers.get("content-length")) > 4096) throw new GuestbookError("too_large", 413);
  if (!request.body) throw new GuestbookError("invalid");
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 4096) { await reader.cancel(); throw new GuestbookError("too_large", 413); }
      chunks.push(value);
    }
    try { return JSON.parse(Buffer.concat(chunks).toString("utf8")) as unknown; }
    catch { throw new GuestbookError("invalid"); }
  } finally { reader.releaseLock(); }
}

export function guestbookHandlers(getStore: () => GuestbookStore, trustProxy = false) {
  const fail = (error: unknown) => {
    if (error instanceof GuestbookError) return Response.json({ error: error.code, retryAfter: error.retryAfter }, { status: error.status, headers: { ...headers, ...(error.retryAfter ? { "Retry-After": String(error.retryAfter) } : {}) } });
    console.error("Guestbook storage request failed.");
    return Response.json({ error: "unavailable" }, { status: 503, headers: { ...headers, "Retry-After": "5" } });
  };
  return {
    GET(request: Request) {
      try {
        const cursor = new URL(request.url).searchParams.get("before");
        if (cursor !== null && (!/^[1-9]\d{0,15}$/.test(cursor) || !Number.isSafeInteger(Number(cursor)))) throw new GuestbookError("invalid");
        return Response.json(getStore().list(cursor ? Number(cursor) : undefined), { headers });
      } catch (error) { return fail(error); }
    },
    async POST(request: Request) {
      try {
        const origin = request.headers.get("origin");
        const host = request.headers.get("host") ?? new URL(request.url).host;
        let validOrigin = false;
        try { const url = new URL(origin ?? ""); validOrigin = ["http:", "https:"].includes(url.protocol) && url.host === host; } catch { /* Reject missing/invalid origins. */ }
        if (!validOrigin || request.headers.get("sec-fetch-site") === "cross-site") throw new GuestbookError("origin", 403);
        const input = await readBody(request);
        // Nginx overwrites X-Real-IP. Never trust the client-supplied X-Forwarded-For chain.
        const forwarded = request.headers.get("x-real-ip") ?? "";
        const client = trustProxy && isIP(forwarded) ? forwarded : "unavailable";
        const result = getStore().add(input, client);
        return Response.json(result, { status: result.created ? 201 : 200, headers });
      } catch (error) { return fail(error); }
    },
  };
}
