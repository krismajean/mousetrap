import Image from "next/image";
import styles from "./Rules.module.css";

const playSteps = [
  {
    title: "Stack",
    body: "Take turns placing live mousetraps. Each trap must touch at least two others.",
  },
  {
    title: "Keep going",
    body: "Play until you run out of traps — or the tower falls and explodes.",
  },
  {
    title: "Have fun",
    body: "That's it. A patient adrenaline game for silly people.",
  },
];

const careNotes = [
  "If a few traps fall on your turn, still finish the move.",
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
            The rules are short.{" "}
            <span className="highlight-underline">The boom</span> is optional.
          </h2>
        </header>

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

        <div className={styles.split}>
          <div className={styles.splitText}>
            <h3 className={styles.subheading}>How to start</h3>
            <p className={styles.body}>
              Optional: lay down a towel or silicone baking pad for a stable
              base. Place two traps touching each other — tall or short a-frame
              are common. Different setups lead to different games.
            </p>

            <h3 className={styles.subheading}>How do you win?</h3>
            <p className={styles.body}>
              You don&apos;t win at sandcastles. This is like that, with a wee
              more excitement — closer to skateboarding. Everyone who shows up
              wins the day. Go for height. Set people up. Try bold moves.
            </p>
            <p className={styles.body}>
              You{" "}
              <span className="highlight-strike">definitely</span> lose if
              you&apos;re a jerk. When the stack goes boom, celebrate.
            </p>
          </div>

          <figure className={styles.figure}>
            <Image
              src="/winning.jpg"
              alt="Player carefully stacking live mousetraps into a tower"
              width={900}
              height={1200}
              className={styles.figureImage}
              sizes="(max-width: 767px) 100vw, 42vw"
            />
            <figcaption className={styles.caption}>
              This is what winning looks like
            </figcaption>
          </figure>
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
