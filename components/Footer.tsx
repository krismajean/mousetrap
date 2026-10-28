import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <p className={styles.footerEmail}>
          <a href="mailto:hello@mousetrapjenga.com">hello@mousetrapjenga.com</a>
        </p>
        <p className={styles.copyright}>
          All Rights Reserved © 2023 Skillfull Sillness, LLC
        </p>
      </div>
    </footer>
  );
}
