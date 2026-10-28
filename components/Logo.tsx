import styles from "./Logo.module.css";

type LogoProps = {
  className?: string;
};

export function Logo({ className }: LogoProps) {
  return (
    <span className={[styles.logo, className].filter(Boolean).join(" ")}>
      <svg
        className={styles.mark}
        viewBox="0 0 40 40"
        fill="none"
        aria-hidden="true"
      >
        {/* Stacked trap-like bars — a tiny jenga tower */}
        <rect x="4" y="28" width="32" height="6" rx="1" fill="currentColor" />
        <rect x="8" y="20" width="24" height="6" rx="1" fill="currentColor" />
        <rect
          className={styles.accentBar}
          x="12"
          y="12"
          width="16"
          height="6"
          rx="1"
        />
        <rect x="16" y="4" width="8" height="6" rx="1" fill="currentColor" />
      </svg>
      <span className={styles.wordmark}>
        mouse<span className={styles.trap}>trap</span>
        <span className={styles.jenga}>jenga</span>
      </span>
    </span>
  );
}
