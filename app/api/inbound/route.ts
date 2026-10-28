import { NextResponse } from "next/server";
import {
  forwardReceivedEmail,
  getResendConfig,
  includesAddress,
  messageAddresses,
} from "@/lib/resend";
import { verifyResendWebhook } from "@/lib/resend-webhook";

export const runtime = "nodejs";

const HELLO = "hello@mousetrapjenga.com";

type ReceivedEvent = {
  type?: string;
  data?: {
    email_id?: string;
    to?: string[];
    cc?: string[];
    bcc?: string[];
    received_for?: string[];
  };
};

export async function POST(request: Request) {
  const payload = await request.text();
  const secret = process.env.RESEND_WEBHOOK_SECRET?.trim();
  if (!secret) {
    console.error("RESEND_WEBHOOK_SECRET is not set.");
    return NextResponse.json({ error: "Inbound mail is not configured." }, { status: 503 });
  }

  if (!verifyResendWebhook(payload, request.headers, secret)) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  let event: ReceivedEvent;
  try {
    event = JSON.parse(payload) as ReceivedEvent;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (event.type !== "email.received") {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const emailId = event.data?.email_id;
  if (!emailId) {
    return NextResponse.json({ error: "Missing email id." }, { status: 400 });
  }

  const addressedToHello = includesAddress(
    messageAddresses({
      to: event.data?.to,
      cc: event.data?.cc,
      bcc: event.data?.bcc,
      received_for: event.data?.received_for,
    }),
    HELLO,
  );
  if (!addressedToHello) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const config = getResendConfig();
  if (!config) {
    console.error("Resend is not configured (missing env vars).");
    return NextResponse.json({ error: "Inbound mail is not configured." }, { status: 503 });
  }

  try {
    await forwardReceivedEmail(config, emailId);
  } catch (error) {
    console.error("Inbound forward failed:", error);
    return NextResponse.json({ error: "Forward failed." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
