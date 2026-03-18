import React from "react";
import Link from "next/link";

export default function Home(): React.JSX.Element {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg">
      <div className="text-center">
        <h1 className="font-display text-5xl mb-4">
          Quote<span className="text-accent">Part</span>
        </h1>
        <p className="text-text-dim mb-8 text-lg">
          Simulateur d&apos;équité financière pour couples
        </p>
        <Link
          href="/simulate"
          className="inline-flex items-center gap-2 bg-accent text-white px-8 py-3 rounded-lg font-medium hover:brightness-110 transition-colors"
        >
          Commencer la simulation →
        </Link>
      </div>
    </div>
  );
}
