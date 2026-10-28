import { createHmac, timingSafeEqual } from "crypto";

const MAX_SKEW_SECONDS = 5 * 60;

/** Verify a Resend (Svix) webhook signature against the raw request body. */
export function verifyResendWebhook(
  payload: string,
  headers: Headers,
  secret: string,
): boolean {
  const id = headers.get("svix-id");
  const timestamp = headers.get("svix-timestamp");
  const signature = headers.get("svix-signature");
  if (!id || !timestamp || !signature || !secret) return false;

  const sentAt = Number(timestamp);
  if (!Number.isFinite(sentAt)) return false;
  if (Math.abs(Date.now() / 1000 - sentAt) > MAX_SKEW_SECONDS) return false;

  const secretBody = secret.startsWith("whsec_") ? secret.slice("whsec_".length) : secret;
  const key = Buffer.from(secretBody, "base64");
  const expected = createHmac("sha256", key)
    .update(`${id}.${timestamp}.${payload}`)
    .digest("base64");

  return signature.split(" ").some((part) => {
    const value = part.startsWith("v1,") ? part.slice(3) : "";
    if (!value) return false;
    const actual = Buffer.from(value);
    const want = Buffer.from(expected);
    if (actual.length !== want.length) return false;
    return timingSafeEqual(actual, want);
  });
}
