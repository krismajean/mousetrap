"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";
import styles from "./Hero.module.css";
import formStyles from "./EmailForm.module.css";

export function Hero() {
  const [email, setEmail] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [errorMessage, setErrorMessage] = useState(
    "Please enter a valid email address.",
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      setStatus("error");
      return;
    }

    setStatus("loading");

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, website: honeypot }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
      };

      if (!response.ok) {
        setErrorMessage(
          data.error || "Something went wrong. Please try again.",
        );
        setStatus("error");
        return;
      }

      setStatus("success");
      setEmail("");
      setHoneypot("");
    } catch {
      setErrorMessage("Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  return (
    <section className={styles.hero} aria-labelledby="hero-headline">
      <div className={styles.heroBackground} aria-hidden="true">
        <Image
          src="/hero.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className={styles.heroImage}
        />
        <div className={styles.heroOverlay} />
      </div>

      <div className={styles.heroContent}>
        <div className={styles.heroTextBlock}>
          <h2 id="hero-headline" className={styles.headline}>
            It&apos;s not about the traps, but the friends we{" "}
            <span className="highlight-strike">maimed</span> made along the way.
          </h2>

          <h4 className={styles.subheadline}>
            Bond over the <span className="highlight-strike">terror</span> mild
            discomfort of live traps and personal challenges in a quest to build a
            tower without <span className="highlight-underline">too</span> much
            injury.
          </h4>

          <p className={styles.emailPrompt}>
            Share your email and we&apos;ll let you know when we have rad updates.
          </p>

          <form className={formStyles.form} onSubmit={handleSubmit}>
            <label htmlFor="email" className="sr-only">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="Email Address"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                if (status !== "idle") setStatus("idle");
              }}
              className={formStyles.input}
              required
              disabled={status === "loading"}
            />
            <input
              type="text"
              name="website"
              value={honeypot}
              onChange={(event) => setHoneypot(event.target.value)}
              className="sr-only"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
            />
            <button
              type="submit"
              className={formStyles.button}
              disabled={status === "loading"}
            >
              {status === "loading" ? "Signing up…" : "Sign Up"}
            </button>
          </form>

          {status === "success" && (
            <p className={formStyles.message} role="status">
              Thanks! Check your inbox — we&apos;ll be in touch.
            </p>
          )}
          {status === "error" && (
            <p className={formStyles.error} role="alert">
              {errorMessage}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
