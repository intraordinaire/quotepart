import React from "react";
import Hero from "@/components/landing/Hero";
import SocialProof from "@/components/landing/SocialProof";
import PreviewTable from "@/components/landing/PreviewTable";
import HowItWorks from "@/components/landing/HowItWorks";
import ModelsOverview from "@/components/landing/ModelsOverview";
import CTABlock from "@/components/landing/CTABlock";
import Footer from "@/components/landing/Footer";

export default function Home(): React.JSX.Element {
  return (
    <div className="min-h-screen bg-bg">
      {/* Nav */}
      <nav className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-5 md:px-10">
        <div className="flex items-baseline gap-0.5">
          <span className="font-display text-[22px]">Quote</span>
          <span className="font-display text-[22px] text-accent">Part</span>
        </div>
      </nav>

      <Hero />
      <SocialProof />
      <PreviewTable />
      <HowItWorks />
      <ModelsOverview />
      <CTABlock />
      <Footer />
    </div>
  );
}
