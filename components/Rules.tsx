import Image from "next/image";
import styles from "./Rules.module.css";

const playSteps = [
  {
    title: "Start",
    body: "Place two live traps touching each other. An A-frame is a common start.",
  },
  {
    title: "Set Trap and Stack",
    body: "Take turns placing live mousetraps. Each new trap has to touch at least two other traps. Any part of the trap counts.",
  },
  {
    title: "Keep going",
    body: "Play until the tower explodes. Run out of traps? Take ones still touching the playing surface and place them back on the tower so they no longer touch it.",
  },
  {
    title: "How it ends",
    body: "When the pile explodes. The loser set it off. The winner placed the tallest trap.",
  },
];

const careNotes = [
  "If the pile shifts, or only a few traps go off and most of the structure is still up, keep going — if the group agrees the game is still live.",
  "If your trap snaps while you're setting it and the rest of the stack is fine, go again.",
  "Don't move other people's set traps. Play with what you've got.",
  "Keep kitties and tiny humans at a distance — fuzzy mittens and little fingers have a bad time.",
  "After a boom, some traps may still be set. Pick them up carefully — that's when most people get snapped.",
];

export function Rules() {
  return (
    <section className={styles.rules} aria-labelledby="rules-heading">
      <div className={styles.inner}>
        <header className={styles.intro}>
          <p className={styles.eyebrow}>How to play</p>
          <h2 id="rules-heading" className={styles.heading}>
            The rules are short.
          </h2>
        </header>

        <div className={styles.playStage}>
          <figure className={styles.figure}>
            <Image
              src="/winning.jpg"
              alt="Player carefully stacking live mousetraps into a tower"
              fill
              className={styles.figureImage}
              sizes="(max-width: 899px) 100vw, 50vw"
            />
          </figure>

          <ol className={styles.playList}>
            {playSteps.map((step, index) => (
              <li key={step.title} className={styles.playItem}>
                <span className={styles.playIndex} aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className={styles.playCopy}>
                  <h3 className={styles.playTitle}>{step.title}</h3>
                  <p className={styles.playBody}>{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className={styles.care}>
          <h3 className={styles.subheading}>Special situations</h3>
          <ul className={styles.careList}>
            {careNotes.map((note) => (
              <li key={note} className={styles.careItem}>
                {note}
              </li>
            ))}
          </ul>
          <p className={styles.asteroid}>
            Earthquakes and asteroids are fair play.
          </p>
        </div>
      </div>
    </section>
  );
}
