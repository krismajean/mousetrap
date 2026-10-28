import Image from "next/image";
import styles from "./Logo.module.css";

type LogoProps = {
  className?: string;
};

export function Logo({ className }: LogoProps) {
  return (
    <span className={[styles.logo, className].filter(Boolean).join(" ")}>
      <Image
        className={styles.mark}
        src="/logo-mark.png"
        alt=""
        width={369}
        height={377}
        priority
      />
      <span className={styles.wordmark}>
        mouse<span className={styles.trap}>trap</span>
        <span className={styles.jenga}>jenga</span>
      </span>
    </span>
  );
}
