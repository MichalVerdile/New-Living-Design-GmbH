import React, { useState } from "react";
import styles from "./Contact.module.css";
import heroImg from "../../assets/shutterstock_2626257257.jpg";
import { Helmet } from "react-helmet-async";

const FORMSPREE_ENDPOINT = "https://formspree.io/f/xdklvgpb";

const Contact: React.FC = () => {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const onSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    // Honeypot: wenn Bots das ausfüllen, brechen wir "still" ab
    if ((formData.get("website") as string)?.trim()) {
      setStatus("success");
      form.reset();
      return;
    }

    setStatus("loading");

    try {
      // optionaler dynamischer Betreff
      const subject = `Kontakt: ${(formData.get("firstName") || "").toString().trim()} ${(formData.get("lastName") || "").toString().trim()}`.trim();
      formData.append("_subject", subject);

      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: formData,
      });

      if (res.ok) {
        setStatus("success");
        form.reset();
      } else {
        const data = await res.json().catch(() => ({} as any));
        setStatus("error");
        setErrorMsg(
          data?.errors?.[0]?.message ??
          "Senden fehlgeschlagen. Bitte versuchen Sie es später erneut."
        );
      }
    } catch {
      setStatus("error");
      setErrorMsg("Netzwerkfehler. Bitte prüfen Sie Ihre Verbindung und versuchen Sie es erneut.");
    }
  };

  return (
    <main className={styles.contact}>
      {/* SEO Head */}
      <Helmet>
        <title>Kontakt | New Living Design GmbH</title>
        <meta
          name="description"
          content="Kontaktieren Sie die New Living Design GmbH – Showroom in Zofingen (AG). Adresse, Telefon, E-Mail und Öffnungszeiten im Überblick."
        />
        <meta property="og:title" content="Kontakt | New Living Design GmbH" />
        <meta
          property="og:description"
          content="Adresse, Telefonnummer und Öffnungszeiten der New Living Design GmbH. Wir beraten Sie gerne persönlich oder telefonisch."
        />
        <meta property="og:image" content={heroImg} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.newlivingdesign.ch/kontakt" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Kontakt | New Living Design GmbH" />
        <meta
          name="twitter:description"
          content="Jetzt Kontakt aufnehmen: Adresse, Telefonnummer, Showroom und Öffnungszeiten der New Living Design GmbH."
        />
        <meta name="twitter:image" content={heroImg} />

        {/* LocalBusiness Schema.org */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": "New Living Design GmbH",
            "image": "https://www.newlivingdesign.ch" + heroImg,
            "url": "https://www.newlivingdesign.ch/kontakt",
            "telephone": "+41625445853",
            "email": "info@newlivingdesign.ch",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "Im Römerquartier 4A",
              "postalCode": "4800",
              "addressLocality": "Zofingen",
              "addressCountry": "CH"
            },
            "openingHoursSpecification": [
              {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday"],
                "opens": "08:00",
                "closes": "18:00"
              },
              {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": "Saturday",
                "opens": "09:00",
                "closes": "12:00"
              }
            ],
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": 47.2872,
              "longitude": 7.9455
            }
          })}
        </script>
      </Helmet>
      
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles["hero-background"]}>
          <div className={styles["hero-overlay"]}></div>
          <img
            src={heroImg}
            alt="Showroom / Innenausstattung"
            className={styles["hero-bg-image"]}
          />
        </div>

        <div className={styles["hero-container"]}>
          <div className={styles["hero-content"]}>
            <h1 className={styles["hero-title"]}>
              <span className={styles["title-highlight"]}>Kontakt</span>
            </h1>
            <p className={styles["hero-subtitle"]}>
              Wir beraten Sie persönlich, im Showroom oder telefonisch. Schreiben Sie uns
              eine Nachricht oder rufen Sie an.
            </p>
          </div>

          <div className={styles["hero-scroll-indicator"]}>
            <div className={styles["scroll-dot"]}></div>
            <span>Scrollen Sie nach unten</span>
          </div>
        </div>
      </section>

      {/* Kontaktformular (dunkel) */}
      <section className={`${styles.section} ${styles.dark}`}>
        <div className={styles.container}>
          <div className={`${styles["section-header"]} ${styles.centered}`}>
            <span className={styles["section-label"]}>Schreiben Sie uns</span>
            <h2 className={styles["section-title"]}>Nachricht senden</h2>
          </div>

          <div className={styles["form-grid"]}>
            <form className={styles.form} onSubmit={onSubmit} noValidate>
              {/* Honeypot (unsichtbar, aber ohne CSS-Änderung) */}
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                style={{ position: "absolute", left: "-9999px", opacity: 0, width: 1, height: 1 }}
                aria-hidden="true"
              />

              <div className={styles["form-row"]}>
                <div className={styles["form-field"]}>
                  <label>Vorname</label>
                  <input type="text" name="firstName" placeholder="Ihr Vorname" required />
                </div>
                <div className={styles["form-field"]}>
                  <label>Nachname</label>
                  <input type="text" name="lastName" placeholder="Ihr Nachname" required />
                </div>
              </div>

              <div className={styles["form-row"]}>
                <div className={styles["form-field"]}>
                  <label>E-Mail</label>
                  <input type="email" name="email" placeholder="name@beispiel.ch" required />
                </div>
                <div className={styles["form-field"]}>
                  <label>Telefon (optional)</label>
                  <input type="tel" name="phone" placeholder="+41 ..." />
                </div>
              </div>

              <div className={styles["form-field"]}>
                <label>Nachricht</label>
                <textarea name="message" placeholder="Wie können wir helfen?" rows={6} required />
              </div>

              <div className={styles["form-actions"]}>
                <button
                  type="submit"
                  className={styles.cta}
                  disabled={status === "loading"}
                  aria-busy={status === "loading"}
                >
                  <span>{status === "loading" ? "Senden..." : "Senden"}</span>
                  <svg className={styles["cta-arrow"]} viewBox="0 0 24 24" fill="none">
                    <path
                      d="M5 12h14M12 5l7 7-7 7"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                {status === "success" && (
                  <span className={styles.success}>
                    Danke für Ihre Nachricht! Wir melden uns innerhalb von 24 Stunden.
                  </span>
                )}
                {status === "error" && (
                  <span className={styles.error}>
                    {errorMsg}
                  </span>
                )}
              </div>
            </form>
          </div>
          <div className={styles.hint}>
              <div className={styles["hint-icon"]}>
                <svg viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                  <path d="M12 8v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="12" cy="17" r="1" fill="currentColor" />
                </svg>
              </div>
              <p>
                Sie können auch direkt eine E-Mail senden an{" "}
                <a href="mailto:emanuel.verdile@newlivingdesign.ch">
                  emanuel.verdile@newlivingdesign.ch
                </a>.
              </p>
            </div>
        </div>
      </section>

      {/* Kontaktblöcke (hell) */}
      <section className={`${styles.section} ${styles.light}`}>
        <div className={styles.container}>
          <div className={`${styles["section-header"]} ${styles.centered}`}>
            <span className={styles["section-label"]}>So erreichen Sie uns</span>
            <h2 className={styles["section-title"]}>Adresse, Kontakt & Öffnungszeiten</h2>
          </div>

          <div className={styles["info-grid"]}>
            <div className={styles.card}>
              <h3>Kontakt</h3>
              <p className={styles.lines}>
                New Living Design GmbH<br />
                Im Römerquartier 4A<br />
                4800 Zofingen
              </p>

              <div className={styles["contact-list"]}>
                <a href="tel:+41625445853" className={styles["contact-item"]}>
                  <div className={styles["contact-icon"]}>
                    <svg viewBox="0 0 24 24" fill="none">
                      <path
                        d="M22 16.92v3a2 2 0 0 1-2.18 2A19.73 19.73 0 0 1 3.11 5.18 2 2 0 0 1 5.1 3h3a1 1 0 0 1 1 .75l1 3a1 1 0 0 1-.27 1L8.91 9.09a16 16 0 0 0 6 6l1.34-1.94a1 1 0 0 1 1-.27l3 1a1 1 0 0 1 .75 1z"
                        stroke="currentColor"
                        strokeWidth="1"
                      />
                    </svg>
                  </div>
                  <span>T +41 62 544 58 53</span>
                </a>

                <a href="tel:+41767438430" className={styles["contact-item"]}>
                  <div className={styles["contact-icon"]}>
                    <svg viewBox="0 0 24 24" fill="none">
                      <path
                        d="M22 16.92v3a2 2 0 0 1-2.18 2A19.73 19.73 0 0 1 3.11 5.18 2 2 0 0 1 5.1 3h3a1 1 0 0 1 1 .75l1 3a1 1 0 0 1-.27 1L8.91 9.09a16 16 0 0 0 6 6l1.34-1.94a1 1 0 0 1 1-.27l3 1a1 1 0 0 1 .75 1z"
                        stroke="currentColor"
                        strokeWidth="1"
                      />
                    </svg>
                  </div>
                  <span>M +41 76 743 84 30</span>
                </a>

                <a href="mailto:diego.verdile@newlivingdesign.ch" className={styles["contact-item"]}>
                  <div className={styles["contact-icon"]}>
                    <svg viewBox="0 0 24 24" fill="none">
                      <path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" stroke="currentColor" strokeWidth="1" />
                      <path d="M22 6l-10 7L2 6" stroke="currentColor" strokeWidth="1" />
                    </svg>
                  </div>
                  <span>diego.verdile@newlivingdesign.ch</span>
                </a>

                <a href="mailto:emanuel.verdile@newlivingdesign.ch" className={styles["contact-item"]}>
                  <div className={styles["contact-icon"]}>
                    <svg viewBox="0 0 24 24" fill="none">
                      <path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" stroke="currentColor" strokeWidth="1" />
                      <path d="M22 6l-10 7L2 6" stroke="currentColor" strokeWidth="1" />
                    </svg>
                  </div>
                  <span>emanuel.verdile@newlivingdesign.ch</span>
                </a>
              </div>
            </div>

            <div className={styles.card}>
              <h3>Öffnungszeiten</h3>
              <ul className={styles.hours}>
                <li><span>Montag–Freitag</span><span>08:00–12:00</span></li>
                <li><span></span><span>14:00–18:00</span></li>
                <li><span>Samstag</span><span>09:00–12:00</span></li>
                <li><span>Sonntag</span><span>Geschlossen</span></li>
              </ul>
            </div>

            <div className={styles.card}>
              <h3>Showroom</h3>
              <div className={styles.mapwrap}>
                <iframe
                  title="Karte – New Living Design GmbH"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://www.google.com/maps?q=Im%20R%C3%B6merquartier%204A%2C%204800%20Zofingen&output=embed`}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Contact;
