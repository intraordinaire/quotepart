import { useState, useEffect } from "react";

const FONTS_URL = "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Manrope:wght@300;400;500;600;700&display=swap";

const style = document.createElement("link");
style.rel = "stylesheet";
style.href = FONTS_URL;
document.head.appendChild(style);

const css = `
  :root {
    --bg: #FAFAF8;
    --bg-elevated: #FFFFFF;
    --text: #1A1A1A;
    --text-secondary: #7A7A75;
    --text-tertiary: #A8A8A3;
    --accent: #D4593A;
    --accent-light: #FDF0EC;
    --border: #E8E8E4;
    --border-strong: #D1D1CC;
    --surface: #F2F2EF;
    --green: #2D8A56;
    --green-light: #EDF7F0;
    --amber: #C48A1A;
    --amber-light: #FFF8E8;
    --font-display: 'Instrument Serif', Georgia, serif;
    --font-body: 'Manrope', system-ui, sans-serif;
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: var(--font-body);
    -webkit-font-smoothing: antialiased;
    line-height: 1.6;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slideIn {
    from { opacity: 0; transform: translateX(-8px); }
    to { opacity: 1; transform: translateX(0); }
  }

  .fade-up {
    animation: fadeUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
  }

  .fade-in {
    animation: fadeIn 0.5s ease both;
  }

  .stagger-1 { animation-delay: 0.1s; }
  .stagger-2 { animation-delay: 0.2s; }
  .stagger-3 { animation-delay: 0.3s; }
  .stagger-4 { animation-delay: 0.4s; }
  .stagger-5 { animation-delay: 0.5s; }
  .stagger-6 { animation-delay: 0.6s; }
`;

const styleEl = document.createElement("style");
styleEl.textContent = css;
document.head.appendChild(styleEl);

// ─── ICONS ───

const Icons = {
  arrow: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8h10M9 4l4 4-4 4" />
    </svg>
  ),
  check: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7l3 3 5-5" />
    </svg>
  ),
  chart: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="10" width="3" height="8" rx="0.5" /><rect x="8.5" y="6" width="3" height="12" rx="0.5" /><rect x="15" y="2" width="3" height="16" rx="0.5" />
    </svg>
  ),
  sliders: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <line x1="3" y1="5" x2="17" y2="5" /><line x1="3" y1="10" x2="17" y2="10" /><line x1="3" y1="15" x2="17" y2="15" />
      <circle cx="7" cy="5" r="2" fill="var(--accent)" stroke="var(--accent)" /><circle cx="12" cy="10" r="2" fill="var(--accent)" stroke="var(--accent)" /><circle cx="9" cy="15" r="2" fill="var(--accent)" stroke="var(--accent)" />
    </svg>
  ),
  users: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7" cy="6" r="3" /><circle cx="14" cy="7" r="2.5" /><path d="M1 18c0-3.3 2.7-6 6-6s6 2.7 6 6" /><path d="M13 12.5c2.5 0 4.5 2 4.5 4.5" />
    </svg>
  ),
  sparkle: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 2v4M10 14v4M2 10h4M14 10h4M4.5 4.5l2.8 2.8M12.7 12.7l2.8 2.8M15.5 4.5l-2.8 2.8M7.3 12.7l-2.8 2.8" />
    </svg>
  ),
  home: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 7l7-5 7 5v8a1 1 0 01-1 1H3a1 1 0 01-1-1V7z" /><path d="M7 16V9h4v7" />
    </svg>
  ),
  edit: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 3H3a1 1 0 00-1 1v10a1 1 0 001 1h10a1 1 0 001-1V9" /><path d="M13.5 1.5a1.4 1.4 0 012 2L9 10l-3 1 1-3 6.5-6.5z" />
    </svg>
  ),
  results: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="14" height="14" rx="2" /><path d="M6 9l2 2 4-4" />
    </svg>
  ),
  whatif: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12l4-4 3 3 5-6" /><path d="M14 5h-3M14 5v3" />
    </svg>
  ),
};

// ─── LANDING PAGE ───

function Landing({ onEnterApp }) {
  return (
    <div style={{ minHeight: "100vh" }}>
      {/* Nav */}
      <nav style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "20px 40px", maxWidth: 1200, margin: "0 auto",
      }} className="fade-up">
        <div style={{ display: "flex", alignItems: "baseline", gap: 2 }}>
          <span style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 400 }}>Quote</span>
          <span style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 400, color: "var(--accent)" }}>Part</span>
        </div>
        <button onClick={onEnterApp} style={{
          fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600,
          padding: "8px 20px", background: "var(--text)", color: "var(--bg)",
          border: "none", borderRadius: 6, cursor: "pointer", letterSpacing: "0.02em",
        }}>
          Simuler maintenant
        </button>
      </nav>

      {/* Hero */}
      <section style={{
        maxWidth: 900, margin: "0 auto", padding: "100px 40px 80px",
        textAlign: "center",
      }}>
        <div className="fade-up stagger-1" style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "5px 14px", background: "var(--accent-light)", borderRadius: 20,
          fontSize: 12, fontWeight: 600, color: "var(--accent)", marginBottom: 28,
          letterSpacing: "0.04em", textTransform: "uppercase",
        }}>
          Simulateur d'équité financière
        </div>
        <h1 className="fade-up stagger-2" style={{
          fontFamily: "var(--font-display)", fontSize: "clamp(40px, 6vw, 68px)",
          fontWeight: 400, lineHeight: 1.1, marginBottom: 24, letterSpacing: "-0.01em",
        }}>
          Vos dépenses de couple,<br />
          <span style={{ fontStyle: "italic", color: "var(--accent)" }}>justement</span> réparties
        </h1>
        <p className="fade-up stagger-3" style={{
          fontSize: 17, color: "var(--text-secondary)", maxWidth: 520,
          margin: "0 auto 44px", lineHeight: 1.7, fontWeight: 400,
        }}>
          5 modèles d'équité appliqués à vos vrais chiffres. Pas une calculette, un outil pour choisir ensemble ce qui est juste pour vous.
        </p>
        <div className="fade-up stagger-4" style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={onEnterApp} style={{
            fontFamily: "var(--font-body)", fontSize: 15, fontWeight: 600,
            padding: "14px 32px", background: "var(--text)", color: "var(--bg)",
            border: "none", borderRadius: 8, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            Commencer la simulation {Icons.arrow}
          </button>
          <button style={{
            fontFamily: "var(--font-body)", fontSize: 15, fontWeight: 500,
            padding: "14px 32px", background: "transparent", color: "var(--text)",
            border: "1px solid var(--border-strong)", borderRadius: 8, cursor: "pointer",
          }}>
            Comment ça marche
          </button>
        </div>
      </section>

      {/* Social proof / key numbers */}
      <section className="fade-up stagger-5" style={{
        maxWidth: 800, margin: "0 auto", padding: "0 40px 80px",
        display: "flex", justifyContent: "center", gap: 60, flexWrap: "wrap",
      }}>
        {[
          { n: "132 000 €", desc: "d'écart patrimonial possible en 10 ans de 50/50 sur des revenus inégaux" },
          { n: "1,6×", desc: "les femmes font en moyenne 1,6 fois plus de travail domestique (INSEE)" },
          { n: "3 min", desc: "pour simuler et comparer 5 modèles d'équité sur vos vrais chiffres" },
        ].map((item, i) => (
          <div key={i} style={{ textAlign: "center", flex: "1 1 180px" }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 32, marginBottom: 6 }}>{item.n}</div>
            <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5, maxWidth: 200, margin: "0 auto" }}>{item.desc}</div>
          </div>
        ))}
      </section>

      {/* Preview card */}
      <section className="fade-up stagger-5" style={{
        maxWidth: 860, margin: "0 auto", padding: "0 40px 100px",
      }}>
        <div style={{
          background: "var(--bg-elevated)", border: "1px solid var(--border)",
          borderRadius: 12, padding: "32px 36px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 20 }}>
            Aperçu des résultats comparatifs
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "120px repeat(3, 1fr)", gap: 0, fontSize: 13 }}>
            {/* Header */}
            <div style={{ padding: "10px 0", borderBottom: "1px solid var(--border)", fontWeight: 600, color: "var(--text-tertiary)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em" }}></div>
            {["50/50", "Prorata revenus", "Reste à vivre ="].map((h, i) => (
              <div key={i} style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-tertiary)", textAlign: "right" }}>{h}</div>
            ))}
            {/* Thomas */}
            <div style={{ padding: "14px 0", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--text)", display: "inline-block" }} />Thomas
            </div>
            {["1 500 €", "1 811 €", "1 920 €"].map((v, i) => (
              <div key={i} style={{ padding: "14px 12px", textAlign: "right", fontVariantNumeric: "tabular-nums", fontWeight: 500 }}>{v}</div>
            ))}
            {/* Léa */}
            <div style={{ padding: "14px 0", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent)", display: "inline-block" }} />Léa
            </div>
            {["1 500 €", "1 189 €", "1 080 €"].map((v, i) => (
              <div key={i} style={{ padding: "14px 12px", textAlign: "right", fontVariantNumeric: "tabular-nums", fontWeight: 500 }}>{v}</div>
            ))}
            {/* Écart */}
            <div style={{ padding: "14px 0", borderTop: "1px solid var(--border)", fontSize: 11, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.06em", display: "flex", alignItems: "center" }}>
              Écart RAV
            </div>
            {[
              { v: "1 100 €", color: "var(--accent)" },
              { v: "478 €", color: "var(--amber)" },
              { v: "260 €", color: "var(--green)" },
            ].map((item, i) => (
              <div key={i} style={{ padding: "14px 12px", borderTop: "1px solid var(--border)", textAlign: "right", fontWeight: 600, color: item.color, fontVariantNumeric: "tabular-nums" }}>{item.v}</div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{
        maxWidth: 900, margin: "0 auto", padding: "0 40px 100px",
      }}>
        <h2 style={{
          fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 400,
          marginBottom: 12, textAlign: "center",
        }}>
          Comment ça marche
        </h2>
        <p style={{ textAlign: "center", color: "var(--text-secondary)", marginBottom: 56, fontSize: 15 }}>
          Une saisie progressive, chaque étape débloque de nouveaux modèles.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20 }}>
          {[
            { icon: Icons.edit, step: "01", title: "Vos revenus & charges", desc: "Saisissez l'essentiel en 90 secondes. Deux modèles débloqués immédiatement.", accent: false },
            { icon: Icons.sliders, step: "02", title: "Votre contexte", desc: "Temps partiel, charges personnelles, répartition domestique. Chaque palier affine la simulation.", accent: false },
            { icon: Icons.chart, step: "03", title: "Comparez 5 modèles", desc: "Du 50/50 à la contribution totale. Projections sur 1, 5 et 10 ans.", accent: false },
            { icon: Icons.users, step: "04", title: "Partagez & décidez", desc: "Envoyez le lien à votre partenaire. Comparez vos perceptions. Choisissez ensemble.", accent: true },
          ].map((item, i) => (
            <div key={i} style={{
              padding: "28px 24px", borderRadius: 10,
              border: item.accent ? "1.5px solid var(--accent)" : "1px solid var(--border)",
              background: item.accent ? "var(--accent-light)" : "var(--bg-elevated)",
            }}>
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16,
              }}>
                <span style={{ color: item.accent ? "var(--accent)" : "var(--text)" }}>{item.icon}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-tertiary)", letterSpacing: "0.06em" }}>{item.step}</span>
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>{item.title}</h3>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5 models */}
      <section style={{
        maxWidth: 900, margin: "0 auto", padding: "0 40px 100px",
      }}>
        <h2 style={{
          fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 400,
          marginBottom: 12, textAlign: "center",
        }}>
          5 façons de voir l'équité
        </h2>
        <p style={{ textAlign: "center", color: "var(--text-secondary)", marginBottom: 48, fontSize: 15, maxWidth: 500, margin: "0 auto 48px" }}>
          Aucun modèle n'est "le bon". L'outil vous les montre tous pour que vous choisissiez celui qui correspond à votre couple.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {[
            { num: "01", name: "50/50", desc: "Chacun paie la moitié. Simple, mais rarement équitable quand les revenus diffèrent.", tag: "Baseline" },
            { num: "02", name: "Prorata revenus", desc: "Chacun contribue proportionnellement à ce qu'il gagne.", tag: "Classique" },
            { num: "03", name: "Reste à vivre égal", desc: "Après contribution, chacun garde le même montant disponible.", tag: "Équitable" },
            { num: "04", name: "Ajusté temps de travail", desc: "Le temps partiel choisi par le couple est compensé dans le calcul.", tag: "Contextuel" },
            { num: "05", name: "Contribution totale", desc: "Intègre la valeur du travail domestique dans la répartition.", tag: "Complet" },
          ].map((m, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 20,
              padding: "20px 24px", borderRadius: 8,
              background: i % 2 === 0 ? "var(--surface)" : "transparent",
              transition: "background 0.2s",
            }}>
              <span style={{ fontFamily: "var(--font-display)", fontSize: 28, color: "var(--text-tertiary)", minWidth: 36 }}>{m.num}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 3 }}>
                  <span style={{ fontSize: 15, fontWeight: 600 }}>{m.name}</span>
                  <span style={{
                    fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em",
                    padding: "2px 8px", borderRadius: 4, background: "var(--border)", color: "var(--text-secondary)",
                  }}>{m.tag}</span>
                </div>
                <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{m.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA finale */}
      <section style={{
        maxWidth: 600, margin: "0 auto", padding: "0 40px 120px", textAlign: "center",
      }}>
        <div style={{
          background: "var(--text)", borderRadius: 14, padding: "56px 40px",
          color: "var(--bg)",
        }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 400, marginBottom: 12, color: "#fff" }}>
            Prêts à en discuter ?
          </h2>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", marginBottom: 32, lineHeight: 1.7 }}>
            Zéro compte. Zéro stockage serveur. Vos données restent sur votre appareil.
          </p>
          <button onClick={onEnterApp} style={{
            fontFamily: "var(--font-body)", fontSize: 15, fontWeight: 600,
            padding: "14px 36px", background: "var(--accent)", color: "#fff",
            border: "none", borderRadius: 8, cursor: "pointer",
            display: "inline-flex", alignItems: "center", gap: 8,
          }}>
            Lancer la simulation {Icons.arrow}
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: "1px solid var(--border)", padding: "24px 40px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        maxWidth: 1200, margin: "0 auto", fontSize: 12, color: "var(--text-tertiary)",
      }}>
        <span style={{ fontFamily: "var(--font-display)", fontSize: 15 }}>
          Quote<span style={{ color: "var(--accent)" }}>Part</span>
        </span>
        <span>Données INSEE · Aucune donnée stockée · Code source ouvert</span>
      </footer>
    </div>
  );
}

// ─── APP SKELETON ───

function AppShell({ onBackToLanding }) {
  const [activeTab, setActiveTab] = useState("saisie");
  const [activePalier, setActivePalier] = useState(0); // 0 = mode choice
  const [hasChildren, setHasChildren] = useState(true);
  const [fillMode, setFillMode] = useState(null); // "full" | "shared"

  const isShared = fillMode === "shared";

  const paliers = [
    { n: 1, label: "Revenus & charges", unlocks: "Modèles 1-2" },
    { n: 2, label: "Charges perso", unlocks: "Modèle 3" },
    { n: 3, label: "Temps de travail", unlocks: "Modèle 4" },
    { n: 4, label: "Charge domestique", unlocks: "Modèle 5" },
  ];

  const tabs = [
    { id: "saisie", label: "Saisie", icon: Icons.edit },
    { id: "resultats", label: "Résultats", icon: Icons.results },
    { id: "whatif", label: "Et si...", icon: Icons.whatif },
  ];

  const LockedField = ({ name }) => (
    <div style={{
      padding: "9px 12px", border: "1px dashed var(--border-strong)", borderRadius: 6,
      background: "var(--surface)", fontSize: 13, color: "var(--text-tertiary)",
      display: "flex", alignItems: "center", gap: 6, fontStyle: "italic",
    }}>
      {Icons.users} {name} complétera
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Top bar */}
      <header style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "14px 28px", borderBottom: "1px solid var(--border)",
        background: "var(--bg-elevated)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <button onClick={onBackToLanding} style={{
            background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)",
            display: "flex", alignItems: "center", gap: 6, fontFamily: "var(--font-body)", fontSize: 13,
          }}>
            {Icons.home} <span style={{ fontFamily: "var(--font-display)", fontSize: 17 }}>Quote<span style={{ color: "var(--accent)" }}>Part</span></span>
          </button>
          <span style={{ color: "var(--border-strong)" }}>|</span>
          <span style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 500 }}>Nouvelle simulation</span>
        </div>
        {fillMode && (
          <span style={{
            fontSize: 11, fontWeight: 600, padding: "4px 12px", borderRadius: 20,
            background: isShared ? "var(--accent-light)" : "var(--surface)",
            color: isShared ? "var(--accent)" : "var(--text-secondary)",
          }}>
            {isShared ? "Chacun·e ses données" : "Je remplis pour nous deux"}
          </span>
        )}
      </header>

      {/* Tab nav */}
      <nav style={{
        display: "flex", gap: 0, borderBottom: "1px solid var(--border)",
        background: "var(--bg-elevated)", padding: "0 28px",
      }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 500,
            padding: "12px 20px", background: "none", border: "none",
            borderBottom: activeTab === tab.id ? "2px solid var(--text)" : "2px solid transparent",
            color: activeTab === tab.id ? "var(--text)" : "var(--text-tertiary)",
            cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
            transition: "all 0.15s",
          }}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </nav>

      {/* Content */}
      <div style={{ flex: 1, display: "flex", maxWidth: 1200, margin: "0 auto", width: "100%", padding: "0" }}>

        {activeTab === "saisie" && (
          <div style={{ display: "flex", flex: 1, width: "100%" }}>
            {/* Palier sidebar */}
            <aside style={{
              width: 240, borderRight: "1px solid var(--border)", padding: "24px 0",
              background: "var(--bg-elevated)", flexShrink: 0,
            }}>
              <div style={{ padding: "0 20px", marginBottom: 20 }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-tertiary)", marginBottom: 4 }}>Progression</div>
                <div style={{ height: 3, background: "var(--border)", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${Math.max(activePalier, 0) * 25}%`, background: "var(--accent)", borderRadius: 2, transition: "width 0.3s ease" }} />
                </div>
              </div>
              {paliers.map(p => (
                <button key={p.n} onClick={() => fillMode && setActivePalier(p.n)} style={{
                  display: "flex", alignItems: "flex-start", gap: 12, width: "100%",
                  padding: "12px 20px", background: activePalier === p.n ? "var(--surface)" : "transparent",
                  border: "none", borderLeft: activePalier === p.n ? "2px solid var(--accent)" : "2px solid transparent",
                  cursor: fillMode ? "pointer" : "default", textAlign: "left", transition: "all 0.15s",
                  opacity: fillMode ? 1 : 0.5,
                }}>
                  <span style={{
                    width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 700, flexShrink: 0, marginTop: 1,
                    background: p.n <= activePalier ? "var(--text)" : "var(--surface)",
                    color: p.n <= activePalier ? "var(--bg)" : "var(--text-tertiary)",
                    border: p.n <= activePalier ? "none" : "1px solid var(--border)",
                  }}>{p.n <= activePalier - 1 ? "✓" : p.n}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", fontFamily: "var(--font-body)" }}>{p.label}</div>
                    <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 2, fontFamily: "var(--font-body)" }}>Débloque {p.unlocks}</div>
                  </div>
                </button>
              ))}
            </aside>

            {/* Form content */}
            <main style={{ flex: 1, padding: "32px 40px", maxWidth: 640 }}>

              {/* ─── MODE CHOICE ─── */}
              {activePalier === 0 && (
                <div className="fade-in">
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: 28, marginBottom: 8 }}>Comment souhaitez-vous remplir ?</h2>
                  <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 36, lineHeight: 1.7 }}>
                    Vous pourrez changer d'avis à tout moment.
                  </p>

                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <button onClick={() => { setFillMode("full"); setActivePalier(1); }} style={{
                      display: "flex", alignItems: "flex-start", gap: 16, padding: "24px",
                      background: "var(--bg-elevated)", border: "1.5px solid var(--border)",
                      borderRadius: 10, cursor: "pointer", textAlign: "left",
                      transition: "border-color 0.15s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = "var(--text)"}
                    onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
                    >
                      <span style={{
                        width: 40, height: 40, borderRadius: 10, background: "var(--surface)",
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                        color: "var(--text)",
                      }}>{Icons.edit}</span>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4, fontFamily: "var(--font-body)" }}>Je remplis pour nous deux</div>
                        <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, fontFamily: "var(--font-body)" }}>
                          Vous saisissez les données des deux personnes. Résultats immédiats. Vous pourrez ensuite partager un lien pour que votre partenaire ajuste ses données.
                        </div>
                      </div>
                    </button>

                    <button onClick={() => { setFillMode("shared"); setActivePalier(1); }} style={{
                      display: "flex", alignItems: "flex-start", gap: 16, padding: "24px",
                      background: "var(--bg-elevated)", border: "1.5px solid var(--border)",
                      borderRadius: 10, cursor: "pointer", textAlign: "left",
                      transition: "border-color 0.15s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = "var(--accent)"}
                    onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
                    >
                      <span style={{
                        width: 40, height: 40, borderRadius: 10, background: "var(--accent-light)",
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                        color: "var(--accent)",
                      }}>{Icons.users}</span>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4, fontFamily: "var(--font-body)" }}>On remplit chacun·e nos données</div>
                        <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, fontFamily: "var(--font-body)" }}>
                          Vous saisissez vos données et les charges communes. Votre partenaire recevra un lien pour compléter les siennes. Plus juste, notamment pour la charge domestique.
                        </div>
                        <div style={{
                          marginTop: 8, display: "inline-flex", alignItems: "center", gap: 4,
                          fontSize: 11, fontWeight: 600, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.04em",
                        }}>
                          Recommandé pour la confrontation des perceptions
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* ─── PALIER 1 ─── */}
              {activePalier === 1 && (
                <div className="fade-in">
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: 26, marginBottom: 4 }}>Revenus & charges communes</h2>
                  <p style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: 32 }}>L'essentiel pour démarrer. Débloque les modèles 50/50 et Prorata.</p>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }}>
                    <FormField label="Prénom personne 1" placeholder="Thomas" />
                    <FormField label="Prénom personne 2" placeholder="Léa" />
                    <FormField label="Revenu net mensuel P1" placeholder="3 200" suffix="€" />
                    {isShared
                      ? <div><label style={{ fontSize: 12, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 5, display: "block" }}>Revenu net mensuel P2</label><LockedField name="Léa" /></div>
                      : <FormField label="Revenu net mensuel P2" placeholder="2 100" suffix="€" />
                    }
                  </div>

                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Charges communes mensuelles</div>
                    <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
                      <PillToggle label="Montant global" active />
                      <PillToggle label="Détail par catégorie" />
                    </div>
                    <FormField label="" placeholder="3 000" suffix="€/mois" />
                  </div>

                  <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-secondary)", cursor: "pointer", marginBottom: 32 }}>
                    <input type="checkbox" checked={hasChildren} onChange={e => setHasChildren(e.target.checked)} style={{ accentColor: "var(--accent)" }} />
                    Nous avons des enfants
                  </label>

                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <button onClick={() => setActivePalier(0)} style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 500, padding: "10px 20px", background: "none", color: "var(--text-secondary)", border: "1px solid var(--border)", borderRadius: 6, cursor: "pointer" }}>
                      Retour
                    </button>
                    <button onClick={() => setActivePalier(2)} style={{
                      fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600,
                      padding: "10px 24px", background: "var(--text)", color: "var(--bg)",
                      border: "none", borderRadius: 6, cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 6,
                    }}>
                      Suivant {Icons.arrow}
                    </button>
                  </div>
                </div>
              )}

              {/* ─── PALIER 2 ─── */}
              {activePalier === 2 && (
                <div className="fade-in">
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: 26, marginBottom: 4 }}>Charges personnelles</h2>
                  <p style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: 6 }}>Les dépenses qui grèvent le reste à vivre de chacun. Débloque le modèle Reste à vivre égal.</p>
                  <p style={{ color: "var(--text-tertiary)", fontSize: 12, marginBottom: 32, fontStyle: "italic" }}>Optionnel, vous pouvez passer cette étape.</p>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 32 }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-tertiary)", marginBottom: 12 }}>Thomas</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        <FormField label="Transport domicile-travail" placeholder="80" suffix="€" />
                        <FormField label="Prêt personnel" placeholder="0" suffix="€" />
                        <FormField label="Mutuelle individuelle" placeholder="45" suffix="€" />
                        <FormField label="Autre" placeholder="0" suffix="€" />
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-tertiary)", marginBottom: 12 }}>Léa</div>
                      {isShared ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                          <LockedField name="Léa" />
                        </div>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                          <FormField label="Transport domicile-travail" placeholder="40" suffix="€" />
                          <FormField label="Prêt personnel" placeholder="150" suffix="€" />
                          <FormField label="Mutuelle individuelle" placeholder="45" suffix="€" />
                          <FormField label="Autre" placeholder="0" suffix="€" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <button onClick={() => setActivePalier(1)} style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 500, padding: "10px 20px", background: "none", color: "var(--text-secondary)", border: "1px solid var(--border)", borderRadius: 6, cursor: "pointer" }}>
                      Retour
                    </button>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => setActivePalier(3)} style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 500, padding: "10px 20px", background: "none", color: "var(--text-secondary)", border: "1px solid var(--border)", borderRadius: 6, cursor: "pointer" }}>
                        Passer
                      </button>
                      <button onClick={() => setActivePalier(3)} style={{
                        fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600,
                        padding: "10px 24px", background: "var(--text)", color: "var(--bg)",
                        border: "none", borderRadius: 6, cursor: "pointer",
                        display: "flex", alignItems: "center", gap: 6,
                      }}>
                        Suivant {Icons.arrow}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ─── PALIER 3 ─── */}
              {activePalier === 3 && (
                <div className="fade-in">
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: 26, marginBottom: 4 }}>Temps de travail</h2>
                  <p style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: 6 }}>Le temps partiel a un coût. Ce palier le rend visible. Débloque le modèle Ajusté temps.</p>
                  <p style={{ color: "var(--text-tertiary)", fontSize: 12, marginBottom: 32, fontStyle: "italic" }}>Optionnel, vous pouvez passer cette étape.</p>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 32 }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-tertiary)", marginBottom: 12 }}>Thomas</div>
                      <SelectField label="Quotité" options={["Temps plein (100%)", "90%", "80%", "Mi-temps (50%)", "Autre"]} defaultVal="Temps plein (100%)" />
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-tertiary)", marginBottom: 12 }}>Léa</div>
                      {isShared ? (
                        <LockedField name="Léa" />
                      ) : (
                        <>
                          <SelectField label="Quotité" options={["Temps plein (100%)", "90%", "80%", "Mi-temps (50%)", "Autre"]} defaultVal="80%" />
                          <div style={{ marginTop: 12 }}>
                            <FormField label="Salaire théorique temps plein" placeholder="2 625" suffix="€" />
                          </div>
                          <div style={{ marginTop: 12 }}>
                            <SelectField label="Motif" options={["Choix du couple (enfants)", "Choix personnel", "Contrainte médicale"]} defaultVal="Choix du couple (enfants)" />
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <button onClick={() => setActivePalier(2)} style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 500, padding: "10px 20px", background: "none", color: "var(--text-secondary)", border: "1px solid var(--border)", borderRadius: 6, cursor: "pointer" }}>Retour</button>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => setActivePalier(4)} style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 500, padding: "10px 20px", background: "none", color: "var(--text-secondary)", border: "1px solid var(--border)", borderRadius: 6, cursor: "pointer" }}>Passer</button>
                      <button onClick={() => setActivePalier(4)} style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600, padding: "10px 24px", background: "var(--text)", color: "var(--bg)", border: "none", borderRadius: 6, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>Suivant {Icons.arrow}</button>
                    </div>
                  </div>
                </div>
              )}

              {/* ─── PALIER 4 ─── */}
              {activePalier === 4 && (
                <div className="fade-in">
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: 26, marginBottom: 4 }}>Répartition domestique</h2>
                  <p style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: 6 }}>Qui fait quoi à la maison ? Débloque le modèle Contribution totale.</p>
                  <p style={{ color: "var(--text-tertiary)", fontSize: 12, marginBottom: 32, fontStyle: "italic" }}>
                    {isShared
                      ? "Votre perception. Léa remplira la sienne via le lien partagé."
                      : "Estimez la répartition. Votre partenaire pourra ajuster via le lien de correction."
                    }
                  </p>

                  <div style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: 32 }}>
                    <SliderField label="Courses alimentaires" leftName="Thomas" rightName="Léa" defaultValue={35} hours="3h/sem" />
                    <SliderField label="Préparation des repas" leftName="Thomas" rightName="Léa" defaultValue={40} hours="7h/sem" />
                    <SliderField label="Ménage & linge" leftName="Thomas" rightName="Léa" defaultValue={25} hours="6h/sem" />
                    <SliderField label="Admin & paperasse" leftName="Thomas" rightName="Léa" defaultValue={30} hours="2h/sem" />
                    {hasChildren && <SliderField label="RDV enfants" leftName="Thomas" rightName="Léa" defaultValue={20} hours="2h/sem" />}
                    {hasChildren && <SliderField label="Accompagnement scolaire" leftName="Thomas" rightName="Léa" defaultValue={35} hours="3h/sem" />}
                    <SliderField label="Bricolage & entretien" leftName="Thomas" rightName="Léa" defaultValue={75} hours="2h/sem" />
                    <SliderField label="Organisation & planification" leftName="Thomas" rightName="Léa" defaultValue={30} hours="3h/sem" />
                  </div>

                  <div style={{
                    padding: "12px 16px", background: "var(--surface)", borderRadius: 8,
                    fontSize: 12, color: "var(--text-secondary)", marginBottom: 24, lineHeight: 1.6,
                    borderLeft: "3px solid var(--border-strong)",
                  }}>
                    Heures de référence basées sur l'Enquête Emploi du Temps (INSEE). Valorisation : SMIC net horaire (9,57 €/h). <span style={{ textDecoration: "underline", cursor: "pointer" }}>Modifier la valeur horaire</span>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <button onClick={() => setActivePalier(3)} style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 500, padding: "10px 20px", background: "none", color: "var(--text-secondary)", border: "1px solid var(--border)", borderRadius: 6, cursor: "pointer" }}>Retour</button>

                    {isShared ? (
                      /* Mode partagé : seul bouton = envoyer à P2 */
                      <button onClick={() => setActiveTab("resultats")} style={{
                        fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600,
                        padding: "14px 28px", background: "var(--accent)", color: "#fff",
                        border: "none", borderRadius: 8, cursor: "pointer",
                        display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                      }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          {Icons.users} Copier le lien pour Léa
                        </span>
                        <span style={{ fontSize: 11, fontWeight: 400, color: "rgba(255,255,255,0.7)" }}>Elle complétera ses données et verra les résultats</span>
                      </button>
                    ) : (
                      /* Mode complet : résultats directs + option de partager */
                      <div style={{ display: "flex", gap: 10 }}>
                        <button onClick={() => setActiveTab("resultats")} style={{
                          fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600,
                          padding: "14px 24px", background: "var(--text)", color: "var(--bg)",
                          border: "none", borderRadius: 8, cursor: "pointer",
                          display: "flex", alignItems: "center", gap: 6,
                        }}>
                          {Icons.results} Voir les résultats
                        </button>
                        <button onClick={() => setActiveTab("resultats")} style={{
                          fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 500,
                          padding: "14px 20px", background: "none", color: "var(--text-secondary)",
                          border: "1px solid var(--border)", borderRadius: 8, cursor: "pointer",
                          display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
                        }}>
                          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>{Icons.users} Lien de correction</span>
                          <span style={{ fontSize: 10, color: "var(--text-tertiary)" }}>Léa pourra ajuster ses données</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </main>
          </div>
        )}

        {activeTab === "resultats" && (
          <main style={{ flex: 1, padding: "32px 40px", maxWidth: 960 }} className="fade-in">
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 28, marginBottom: 4 }}>Vos résultats</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: 28 }}>5 modèles d'équité appliqués à votre situation. Cliquez sur un modèle pour voir le détail.</p>

            {/* Comparison table */}
            <div style={{
              background: "var(--bg-elevated)", border: "1px solid var(--border)",
              borderRadius: 10, padding: "24px 28px", marginBottom: 24,
              overflowX: "auto",
            }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, fontVariantNumeric: "tabular-nums" }}>
                <thead>
                  <tr>
                    <th style={{ ...thStyle, width: 100 }}></th>
                    <th style={thStyle}>50/50</th>
                    <th style={thStyle}>Prorata</th>
                    <th style={thStyle}>RAV égal</th>
                    <th style={thStyle}>Ajusté temps</th>
                    <th style={{ ...thStyle, color: "var(--accent)" }}>Contribution totale</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ ...tdStyle, fontWeight: 600 }}>
                      <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "var(--text)", marginRight: 6 }} />Thomas
                    </td>
                    <td style={tdStyle}>1 500 €</td>
                    <td style={tdStyle}>1 811 €</td>
                    <td style={tdStyle}>1 920 €</td>
                    <td style={tdStyle}>1 734 €</td>
                    <td style={tdStyle}>1 650 €</td>
                  </tr>
                  <tr>
                    <td style={{ ...tdStyle, fontWeight: 600 }}>
                      <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", marginRight: 6 }} />Léa
                    </td>
                    <td style={tdStyle}>1 500 €</td>
                    <td style={tdStyle}>1 189 €</td>
                    <td style={tdStyle}>1 080 €</td>
                    <td style={tdStyle}>1 266 €</td>
                    <td style={tdStyle}>1 350 €</td>
                  </tr>
                  <tr style={{ borderTop: "1px solid var(--border)" }}>
                    <td style={{ ...tdStyle, fontWeight: 600, fontSize: 11, color: "var(--text-tertiary)" }}>Écart RAV</td>
                    <td style={{ ...tdStyle, fontWeight: 700, color: "var(--accent)" }}>1 100 €</td>
                    <td style={{ ...tdStyle, fontWeight: 700, color: "var(--amber)" }}>478 €</td>
                    <td style={{ ...tdStyle, fontWeight: 700, color: "var(--green)" }}>260 €</td>
                    <td style={{ ...tdStyle, fontWeight: 700, color: "var(--amber)" }}>632 €</td>
                    <td style={{ ...tdStyle, fontWeight: 700, color: "var(--amber)" }}>800 €</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Equity gauges */}
            <div style={{
              background: "var(--bg-elevated)", border: "1px solid var(--border)",
              borderRadius: 10, padding: "24px 28px", marginBottom: 24,
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-tertiary)", marginBottom: 16 }}>Indice d'équité</div>
              {[
                { label: "50/50", pct: 8, color: "var(--accent)" },
                { label: "Prorata", pct: 46, color: "var(--amber)" },
                { label: "RAV égal", pct: 80, color: "var(--green)" },
                { label: "Ajusté temps", pct: 35, color: "var(--amber)" },
                { label: "Contribution totale", pct: 58, color: "var(--amber)" },
              ].map((g, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                  <span style={{ fontSize: 12, fontWeight: 500, width: 130, color: "var(--text-secondary)", textAlign: "right" }}>{g.label}</span>
                  <div style={{ flex: 1, height: 6, background: "var(--surface)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${g.pct}%`, background: g.color, borderRadius: 3, transition: "width 0.6s ease" }} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, width: 36, color: g.color }}>{g.pct}%</span>
                </div>
              ))}
            </div>

            {/* Projection */}
            <div style={{
              background: "var(--bg-elevated)", border: "1px solid var(--border)",
              borderRadius: 10, padding: "24px 28px", marginBottom: 24,
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-tertiary)", marginBottom: 16 }}>Écart d'épargne potentiel entre Thomas et Léa</div>
              <div style={{ display: "grid", gridTemplateColumns: "130px repeat(3, 1fr)", gap: 0, fontSize: 13 }}>
                <div style={thStyle}></div>
                <div style={thStyle}>Sur 1 an</div>
                <div style={thStyle}>Sur 5 ans</div>
                <div style={thStyle}>Sur 10 ans</div>
                {[
                  { m: "50/50", vals: ["13 200 €", "66 000 €", "132 000 €"] },
                  { m: "Prorata", vals: ["5 736 €", "28 680 €", "57 360 €"] },
                  { m: "RAV égal", vals: ["3 120 €", "15 600 €", "31 200 €"] },
                ].map((row, i) => (
                  [
                    <div key={`l${i}`} style={{ ...tdStyle, fontWeight: 500, fontSize: 12, color: "var(--text-secondary)" }}>{row.m}</div>,
                    ...row.vals.map((v, j) => (
                      <div key={`v${i}${j}`} style={{ ...tdStyle, fontVariantNumeric: "tabular-nums" }}>{v}</div>
                    ))
                  ]
                ))}
              </div>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 16, lineHeight: 1.7, borderTop: "1px solid var(--border)", paddingTop: 16 }}>
                En 50/50, au bout de 10 ans, Thomas aura pu épargner <strong style={{ color: "var(--accent)" }}>132 000 €</strong> de plus que Léa. En modèle reste à vivre égal, cet écart tombe à <strong style={{ color: "var(--green)" }}>31 200 €</strong>.
              </p>
            </div>

            <button onClick={() => setActiveTab("whatif")} style={{
              fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600,
              padding: "10px 24px", background: "var(--text)", color: "var(--bg)",
              border: "none", borderRadius: 6, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 6,
            }}>
              {Icons.whatif} Simuler un "Et si..."
            </button>
          </main>
        )}

        {activeTab === "whatif" && (
          <main style={{ flex: 1, padding: "32px 40px" }} className="fade-in">
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 28, marginBottom: 4 }}>Et si...</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: 28 }}>Modifiez n'importe quel paramètre. Les résultats se recalculent en temps réel.</p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 40px 1fr", gap: 0, alignItems: "start" }}>
              {/* Current */}
              <div style={{
                background: "var(--bg-elevated)", border: "1px solid var(--border)",
                borderRadius: 10, padding: "24px",
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-tertiary)", marginBottom: 16 }}>Situation actuelle</div>
                <div style={{ fontSize: 13, display: "flex", flexDirection: "column", gap: 10 }}>
                  <InfoRow label="Revenu Thomas" value="3 200 €" />
                  <InfoRow label="Revenu Léa" value="2 100 €" />
                  <InfoRow label="Quotité Léa" value="80%" />
                  <InfoRow label="Charges communes" value="3 000 €" />
                  <div style={{ borderTop: "1px solid var(--border)", paddingTop: 10, marginTop: 4 }}>
                    <InfoRow label="Ratio prorata" value="60 / 40" />
                    <div style={{ marginTop: 6 }}><InfoRow label="Écart RAV (prorata)" value="478 €" highlight /></div>
                  </div>
                </div>
              </div>

              {/* Arrow */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", paddingTop: 60, color: "var(--text-tertiary)" }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 10h12M12 6l4 4-4 4" /></svg>
              </div>

              {/* Modified */}
              <div style={{
                background: "var(--accent-light)", border: "1.5px solid var(--accent)",
                borderRadius: 10, padding: "24px",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--accent)" }}>Scénario modifié</div>
                  <button style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>Reset</button>
                </div>
                <div style={{ fontSize: 13, display: "flex", flexDirection: "column", gap: 10 }}>
                  <InfoRow label="Revenu Thomas" value="3 200 €" />
                  <EditableRow label="Revenu Léa" value="2 625 €" changed />
                  <EditableRow label="Quotité Léa" value="100%" changed />
                  <InfoRow label="Charges communes" value="3 000 €" />
                  <div style={{ borderTop: "1px solid rgba(212,89,58,0.2)", paddingTop: 10, marginTop: 4 }}>
                    <InfoRow label="Ratio prorata" value="55 / 45" />
                    <div style={{ marginTop: 6 }}><InfoRow label="Écart RAV (prorata)" value="215 €" highlightGreen /></div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{
              marginTop: 20, padding: "16px 20px", background: "var(--green-light)",
              borderRadius: 8, border: "1px solid rgba(45,138,86,0.15)", fontSize: 13, color: "var(--text)", lineHeight: 1.7,
            }}>
              <strong>Impact du retour à temps plein de Léa :</strong> l'écart de reste à vivre en modèle prorata passe de 478 € à 215 € par mois, soit <strong style={{ color: "var(--green)" }}>3 156 € d'écart en moins par an</strong>.
            </div>
          </main>
        )}
      </div>
    </div>
  );
}

// ─── UI COMPONENTS ───

const thStyle = { padding: "8px 12px", textAlign: "right", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-tertiary)" };
const tdStyle = { padding: "10px 12px", textAlign: "right", fontSize: 13 };

function FormField({ label, placeholder, suffix }) {
  return (
    <div>
      {label && <label style={{ fontSize: 12, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 5, display: "block" }}>{label}</label>}
      <div style={{ position: "relative" }}>
        <input type="text" placeholder={placeholder} style={{
          fontFamily: "var(--font-body)", fontSize: 14, padding: "9px 12px",
          paddingRight: suffix ? 40 : 12,
          border: "1px solid var(--border)", borderRadius: 6, width: "100%",
          background: "var(--bg)", outline: "none", color: "var(--text)",
        }} />
        {suffix && <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "var(--text-tertiary)" }}>{suffix}</span>}
      </div>
    </div>
  );
}

function SelectField({ label, options, defaultVal }) {
  return (
    <div>
      <label style={{ fontSize: 12, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 5, display: "block" }}>{label}</label>
      <select defaultValue={defaultVal} style={{
        fontFamily: "var(--font-body)", fontSize: 14, padding: "9px 12px",
        border: "1px solid var(--border)", borderRadius: 6, width: "100%",
        background: "var(--bg)", color: "var(--text)", outline: "none",
      }}>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function PillToggle({ label, active }) {
  return (
    <span style={{
      fontSize: 12, fontWeight: 500, padding: "5px 14px", borderRadius: 20,
      background: active ? "var(--text)" : "var(--surface)",
      color: active ? "var(--bg)" : "var(--text-secondary)",
      cursor: "pointer", border: active ? "none" : "1px solid var(--border)",
    }}>{label}</span>
  );
}

function SliderField({ label, leftName, rightName, defaultValue, hours }) {
  const [val, setVal] = useState(defaultValue);
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>{hours}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", width: 55, textAlign: "right" }}>{leftName}</span>
        <div style={{ flex: 1, position: "relative" }}>
          <input type="range" min="0" max="100" value={val} onChange={e => setVal(+e.target.value)} style={{
            width: "100%", height: 4, appearance: "none", background: `linear-gradient(to right, var(--text) 0%, var(--text) ${val}%, var(--accent) ${val}%, var(--accent) 100%)`,
            borderRadius: 2, outline: "none", cursor: "pointer",
          }} />
        </div>
        <span style={{ fontSize: 11, fontWeight: 600, color: "var(--accent)", width: 55 }}>{rightName}</span>
      </div>
      <div style={{ textAlign: "center", fontSize: 11, color: "var(--text-tertiary)", marginTop: 2 }}>{val}% / {100 - val}%</div>
    </div>
  );
}

function InfoRow({ label, value, highlight, highlightGreen }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <span style={{ color: "var(--text-secondary)" }}>{label}</span>
      <span style={{ fontWeight: 600, color: highlight ? "var(--accent)" : highlightGreen ? "var(--green)" : "var(--text)", fontVariantNumeric: "tabular-nums" }}>{value}</span>
    </div>
  );
}

function EditableRow({ label, value, changed }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ color: "var(--text-secondary)" }}>{label}</span>
      <span style={{
        fontWeight: 600, color: "var(--accent)", fontVariantNumeric: "tabular-nums",
        padding: "2px 8px", background: "rgba(212,89,58,0.1)", borderRadius: 4,
      }}>{value}</span>
    </div>
  );
}

// ─── ROOT ───

export default function App() {
  const [view, setView] = useState("landing");

  return view === "landing"
    ? <Landing onEnterApp={() => setView("app")} />
    : <AppShell onBackToLanding={() => setView("landing")} />;
}
