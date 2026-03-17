import React from "react";
import Link from "next/link";

export default function Home(): React.JSX.Element {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAFAF8]">
      <div className="text-center">
        <h1 className="font-[Instrument_Serif,serif] text-5xl mb-4">
          Quote<span className="text-[#D4593A]">Part</span>
        </h1>
        <p className="text-zinc-500 mb-8 text-lg">
          Simulateur d&apos;équité financière pour couples
        </p>
        <Link
          href="/simulate"
          className="inline-flex items-center gap-2 bg-zinc-900 text-white px-8 py-3 rounded-lg font-medium hover:bg-zinc-700 transition-colors"
        >
          Commencer la simulation →
        </Link>
      </div>
    </div>
  );
}
