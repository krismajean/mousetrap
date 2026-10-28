import styles from "./Tips.module.css";

const gear = {
  required: "Box of 48 traps",
  optional: [
    "Silicone baking pad",
    "Safety glasses (mostly for show)",
    "Suitcase — if you want to be classier than a cardboard box",
  ],
};

const tipGroups = [
  {
    title: "Placing the traps",
    items: [
      "Exhale slowly like you're in the special forces — it relaxes your hands and sharpens focus.",
      "Three points define a plane. Check that the center of mass is supported, or it'll fall.",
      "Kickstand: lean a trap as a temporary brace when you need a little help.",
    ],
  },
  {
    title: "Photos",
    items: [
      "People get completely absorbed in their move — great candid photos. Remember to smile.",
      "Some folks want to take photos and not play. That's cool. Thanks for documenting the silliness.",
    ],
  },
  {
    title: "Not difficult enough?",
    items: [
      "Use your non-dominant hand.",
      "Set a timer for moves.",
      "Use rat traps with contact explosives.",
    ],
  },
];

const settingTips = [
  "For many, this is the first time they've ever set a mousetrap. Excellent chance to learn — with a little practice you'll set a half-dozen in a minute.",
  "Assemble set traps with the trigger pointing away from you. Fewer accidental snaps.",
  "It's like a knife: one end is safer to grab. Be mindful of the snappy part.",
  "They're not as hair-trigger as you think. Place one upside down to prove it — then stack a few more on top.",
];

export function Tips() {
  return (
    <section className={styles.tips} aria-labelledby="tips-heading">
      <div className={styles.inner}>
        <header className={styles.intro}>
          <p className={styles.eyebrow}>Deeper cuts</p>
          <h2 id="tips-heading" className={styles.heading}>
            Gear, setting traps, and{" "}
            <span className="highlight-underline">pro-tips</span>
          </h2>
        </header>

        <div className={styles.gear}>
          <h3 className={styles.subheading}>Get your gear</h3>
          <p className={styles.required}>{gear.required}</p>
          <p className={styles.optionalLabel}>Optional</p>
          <ul className={styles.list}>
            {gear.optional.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className={styles.setting}>
          <h3 className={styles.subheading}>Setting the traps</h3>
          <ul className={styles.list}>
            {settingTips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
          <p className={styles.video}>
            Need a refresher?{" "}
            <a
              href="https://www.youtube.com/watch?v=qiji5OOYuqw"
              target="_blank"
              rel="noopener noreferrer"
            >
              How to set a mousetrap — Ace Hardware
            </a>
          </p>
        </div>

        <div className={styles.tipGrid}>
          {tipGroups.map((group) => (
            <div key={group.title} className={styles.tipGroup}>
              <h3 className={styles.subheading}>{group.title}</h3>
              <ul className={styles.list}>
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
