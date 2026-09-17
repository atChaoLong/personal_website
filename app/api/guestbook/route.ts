import { resolve } from "node:path";
import { GuestbookStore } from "@/lib/guestbook-store";
import { guestbookHandlers } from "@/lib/guestbook-http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const state = globalThis as typeof globalThis & { guestbookStore?: GuestbookStore };
const handlers = guestbookHandlers(() => {
  state.guestbookStore ??= new GuestbookStore(resolve(process.env.GUESTBOOK_DB_PATH ?? "data/guestbook.sqlite"));
  return state.guestbookStore;
}, process.env.GUESTBOOK_TRUST_PROXY === "1");
export const GET = handlers.GET;
export const POST = handlers.POST;
