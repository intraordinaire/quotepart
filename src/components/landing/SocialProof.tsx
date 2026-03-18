"use client";

import { useEffect, useRef, useState } from "react";

function AnimNum({
  value,
  suffix,
  delay = 0,
}: {
  value: number;
  suffix: string;
  delay?: number;
}): React.JSX.Element {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) {
      // Use requestAnimationFrame to avoid synchronous setState in effect
      requestAnimationFrame(() => setDisplay(value));
      return;
    }

    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting && !started.current) {
          started.current = true;
          const dur = 900;
          const startTime = performance.now();
          const tick = (now: number): void => {
            const p = Math.min((now - startTime - delay) / dur, 1);
            if (p < 0) {
              requestAnimationFrame(tick);
              return;
            }
            const ease = 1 - Math.pow(1 - p, 3);
            setDisplay(Math.round(value * ease));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [value, delay]);

  return (
    <span
      ref={ref}
      className="font-display text-[32px] font-black tracking-tight text-white tabular-nums md:text-[40px]"
    >
      {display.toLocaleString("fr-FR")}
      {suffix}
    </span>
  );
}

const STATS = [
  {
    value: 132000,
    suffix: " €",
    desc: "d'écart patrimonial possible en 10 ans de 50/50 sur des revenus inégaux",
  },
  {
    value: 0,
    suffix: "",
    label: "1,6×",
    desc: "les femmes font en moyenne 1,6 fois plus de travail domestique (INSEE)",
  },
  {
    value: 3,
    suffix: " min",
    desc: "pour simuler et comparer 5 modèles d'équité sur vos vrais chiffres",
  },
] as const;

export default function SocialProof(): React.JSX.Element {
  return (
    <section className="mx-auto flex max-w-[800px] flex-wrap justify-center gap-10 border-t border-b border-border px-6 py-10 md:gap-16 md:px-10">
      {STATS.map((item, i) => (
        <div key={i} className="flex-1 basis-[160px] text-center">
          <div>
            {"label" in item && item.label ? (
              <span className="font-display text-[32px] font-black tracking-tight text-white md:text-[40px]">
                {item.label}
              </span>
            ) : (
              <AnimNum value={item.value} suffix={item.suffix} delay={i * 200} />
            )}
          </div>
          <p className="mt-1.5 font-mono text-xs leading-snug text-text-muted">{item.desc}</p>
        </div>
      ))}
    </section>
  );
}
