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

export type ResendAttachment = {
  filename: string;
  content: string;
  content_type?: string;
  content_id?: string;
};

export function normalizeEmail(raw: string): string | null {
  const email = raw.trim().toLowerCase();
  if (!email || !isValidEmail(email)) return null;
  return email;
}

async function resendRequest(
  apiKey: string,
  path: string,
  init: { method: "GET" | "POST"; body?: Record<string, unknown>; idempotencyKey?: string },
): Promise<{ ok: boolean; status: number; data: unknown }> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
  };
  if (init.body) headers["Content-Type"] = "application/json";
  if (init.idempotencyKey) headers["Idempotency-Key"] = init.idempotencyKey;

  const response = await fetch(`${RESEND_API}${path}`, {
    method: init.method,
    headers,
    body: init.body ? JSON.stringify(init.body) : undefined,
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

  const result = await resendRequest(config.apiKey, "/contacts", {
    method: "POST",
    body,
  });

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
    attachments?: ResendAttachment[];
    idempotencyKey?: string;
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
  if (options.attachments && options.attachments.length > 0) {
    body.attachments = options.attachments;
  }

  const result = await resendRequest(config.apiKey, "/emails", {
    method: "POST",
    body,
    idempotencyKey: options.idempotencyKey,
  });

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

type ReceivedEmail = {
  from?: string;
  to?: string[];
  cc?: string[];
  bcc?: string[];
  received_for?: string[];
  subject?: string | null;
  html?: string | null;
  text?: string | null;
};

type ReceivedAttachment = {
  filename?: string | null;
  content_type?: string | null;
  content_id?: string | null;
  download_url?: string | null;
  size?: number | null;
};

const MAX_ATTACHMENT_BYTES = 8 * 1024 * 1024;

export function messageAddresses(email: ReceivedEmail): string[] {
  return [email.to, email.cc, email.bcc, email.received_for]
    .flatMap((list) => list ?? [])
    .filter((value): value is string => typeof value === "string");
}

export function includesAddress(values: string[], target: string): boolean {
  const want = target.toLowerCase();
  return values.some((value) => {
    const match = value
      .toLowerCase()
      .match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/);
    return match?.[0] === want;
  });
}

/** Re-send a received Resend email to the notify inboxes. */
export async function forwardReceivedEmail(
  config: ResendConfig,
  emailId: string,
): Promise<void> {
  const received = await resendRequest(
    config.apiKey,
    `/emails/receiving/${emailId}`,
    { method: "GET" },
  );
  if (!received.ok) {
    throw new Error(
      `Resend receive lookup failed (${received.status}): ${JSON.stringify(received.data)}`,
    );
  }

  const email = received.data as ReceivedEmail;
  const subject = email.subject?.trim() || "(no subject)";
  const forwardedSubject = /^fwd:/i.test(subject) ? subject : `Fwd: ${subject}`;
  const text =
    email.text?.trim() ||
    "This message had no plain-text body.";
  const html = email.html?.trim() || `<pre>${escapeHtml(text)}</pre>`;

  const attachments = await loadReceivedAttachments(config.apiKey, emailId);

  await sendResendEmail(config, {
    to: config.notifyTo,
    subject: forwardedSubject,
    html,
    text,
    replyTo: email.from,
    attachments,
    idempotencyKey: `forward-hello-${emailId}`,
  });
}

async function loadReceivedAttachments(
  apiKey: string,
  emailId: string,
): Promise<ResendAttachment[]> {
  const listed = await resendRequest(
    apiKey,
    `/emails/receiving/${emailId}/attachments`,
    { method: "GET" },
  );
  if (!listed.ok) {
    throw new Error(
      `Resend attachment list failed (${listed.status}): ${JSON.stringify(listed.data)}`,
    );
  }

  const data = listed.data as { data?: ReceivedAttachment[] };
  const attachments: ResendAttachment[] = [];

  for (const file of data.data ?? []) {
    if (!file.download_url || !file.filename) continue;
    if ((file.size ?? 0) > MAX_ATTACHMENT_BYTES) {
      throw new Error(`Attachment ${file.filename} is too large to forward`);
    }

    const download = await fetch(file.download_url);
    if (!download.ok) {
      throw new Error(`Attachment download failed (${download.status})`);
    }

    const bytes = Buffer.from(await download.arrayBuffer());
    if (bytes.byteLength > MAX_ATTACHMENT_BYTES) {
      throw new Error(`Attachment ${file.filename} is too large to forward`);
    }

    attachments.push({
      filename: file.filename,
      content: bytes.toString("base64"),
      content_type: file.content_type || undefined,
      content_id: file.content_id || undefined,
    });
  }

  return attachments;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
