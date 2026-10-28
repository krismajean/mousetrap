const RESEND_API = "https://api.resend.com";

export type ResendConfig = {
  apiKey: string;
  from: string;
  notifyTo: string[];
  replyTo?: string;
  segmentId?: string;
};

export function getResendConfig(): ResendConfig | null {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM?.trim();
  const notifyRaw = process.env.NOTIFY_EMAIL?.trim();

  if (!apiKey || !from || !notifyRaw) return null;

  const notifyTo = notifyRaw
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);

  if (notifyTo.length === 0) return null;

  return {
    apiKey,
    from,
    notifyTo,
    replyTo: process.env.RESEND_REPLY_TO?.trim() || undefined,
    segmentId: process.env.RESEND_SEGMENT_ID?.trim() || undefined,
  };
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

export function normalizeEmail(raw: string): string | null {
  const email = raw.trim().toLowerCase();
  if (!email || !isValidEmail(email)) return null;
  return email;
}

async function resendFetch(
  apiKey: string,
  path: string,
  body: Record<string, unknown>,
): Promise<{ ok: boolean; status: number; data: unknown }> {
  const response = await fetch(`${RESEND_API}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  let data: unknown = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  return { ok: response.ok, status: response.status, data };
}

/** Upsert contact into Resend; optional segment for broadcast lists. */
export async function syncResendContact(
  config: ResendConfig,
  email: string,
): Promise<void> {
  const body: Record<string, unknown> = {
    email,
    unsubscribed: false,
  };

  if (config.segmentId) {
    body.segments = [{ id: config.segmentId }];
  }

  const result = await resendFetch(config.apiKey, "/contacts", body);

  // 409 = already exists — treat as success for signup
  if (!result.ok && result.status !== 409) {
    throw new Error(
      `Resend contact failed (${result.status}): ${JSON.stringify(result.data)}`,
    );
  }
}

export async function sendResendEmail(
  config: ResendConfig,
  options: {
    to: string[];
    subject: string;
    html: string;
    text: string;
    replyTo?: string;
  },
): Promise<void> {
  const body: Record<string, unknown> = {
    from: config.from,
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text,
  };

  const replyTo = options.replyTo || config.replyTo;
  if (replyTo) body.reply_to = replyTo;

  const result = await resendFetch(config.apiKey, "/emails", body);

  if (!result.ok) {
    throw new Error(
      `Resend email failed (${result.status}): ${JSON.stringify(result.data)}`,
    );
  }
}

export function teamSignupEmail(email: string): {
  subject: string;
  html: string;
  text: string;
} {
  return {
    subject: `New mousetrapjenga signup: ${email}`,
    text: `New email signup on mousetrapjenga.com\n\nEmail: ${email}\n`,
    html: `
      <div style="font-family: system-ui, sans-serif; line-height: 1.5;">
        <p><strong>New email signup</strong> on mousetrapjenga.com</p>
        <p>Email: <a href="mailto:${email}">${email}</a></p>
      </div>
    `.trim(),
  };
}

export function visitorConfirmationEmail(): {
  subject: string;
  html: string;
  text: string;
} {
  return {
    subject: "You're on the mousetrapjenga list",
    text: [
      "Thanks for signing up for mousetrapjenga updates.",
      "",
      "We'll let you know when we have rad news — rules, gear, and the next boom.",
      "",
      "— mousetrapjenga",
      "https://www.mousetrapjenga.com",
    ].join("\n"),
    html: `
      <div style="font-family: Poppins, system-ui, sans-serif; background:#000; color:#fff; padding:32px 24px;">
        <p style="margin:0 0 8px; font-size:12px; letter-spacing:0.14em; text-transform:uppercase; color:#f0123c;">mousetrapjenga</p>
        <h1 style="margin:0 0 16px; font-size:24px; font-weight:500; line-height:1.2;">You're on the list.</h1>
        <p style="margin:0 0 12px; font-size:16px; line-height:1.55; opacity:0.9;">
          Thanks for signing up. We'll let you know when we have rad updates —
          rules, gear, and the next boom.
        </p>
        <p style="margin:24px 0 0; font-size:14px; opacity:0.7;">
          <a href="https://www.mousetrapjenga.com" style="color:#f5e6b8;">www.mousetrapjenga.com</a>
        </p>
      </div>
    `.trim(),
  };
}
