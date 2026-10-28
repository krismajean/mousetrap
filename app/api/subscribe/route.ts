import { NextResponse } from "next/server";
import {
  getResendConfig,
  normalizeEmail,
  sendResendEmail,
  syncResendContact,
  teamSignupEmail,
  visitorConfirmationEmail,
} from "@/lib/resend";

export const runtime = "nodejs";

type SubscribeBody = {
  email?: string;
  website?: string; // honeypot
};

export async function POST(request: Request) {
  let body: SubscribeBody;
  try {
    body = (await request.json()) as SubscribeBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Bots fill hidden fields — pretend success
  if (body.website && body.website.trim().length > 0) {
    return NextResponse.json({ ok: true });
  }

  const email = normalizeEmail(body.email ?? "");
  if (!email) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 },
    );
  }

  const config = getResendConfig();
  if (!config) {
    console.error("Resend is not configured (missing env vars).");
    return NextResponse.json(
      { error: "Email signup is temporarily unavailable." },
      { status: 503 },
    );
  }

  try {
    await syncResendContact(config, email);
  } catch (error) {
    console.error("Resend contact sync failed:", error);
    return NextResponse.json(
      { error: "Could not save your signup. Try again." },
      { status: 502 },
    );
  }

  const team = teamSignupEmail(email);
  try {
    await sendResendEmail(config, {
      to: config.notifyTo,
      subject: team.subject,
      html: team.html,
      text: team.text,
      replyTo: email,
    });
  } catch (error) {
    console.error("Resend team notify failed:", error);
    return NextResponse.json(
      { error: "Could not complete signup. Try again." },
      { status: 502 },
    );
  }

  const visitor = visitorConfirmationEmail();
  try {
    await sendResendEmail(config, {
      to: [email],
      subject: visitor.subject,
      html: visitor.html,
      text: visitor.text,
    });
  } catch (error) {
    // Team already notified and contact saved — don't fail the signup
    console.error("Resend visitor confirmation failed:", error);
  }

  return NextResponse.json({ ok: true });
}
