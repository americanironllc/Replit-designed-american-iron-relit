import { useState, useEffect } from "react";
import logoImg from "@assets/american_iron_new_logo_1771911523492.png";

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<"enter" | "hold" | "exit">("enter");
  const prefersReducedMotion = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (prefersReducedMotion) {
      onComplete();
      return;
    }
    const t1 = setTimeout(() => setPhase("hold"), 600);
    const t2 = setTimeout(() => setPhase("exit"), 1600);
    const t3 = setTimeout(() => onComplete(), 2100);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete, prefersReducedMotion]);

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black"
      style={{
        animation: phase === "exit" ? "flash-splash-exit 0.5s ease-in forwards" : undefined,
      }}
      data-testid="splash-screen"
    >
      <img
        src={logoImg}
        alt="American Iron LLC"
        className="w-44 sm:w-56"
        style={{
          animation: "flash-splash-logo 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards",
          filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.5)) drop-shadow(0 8px 24px rgba(255,205,17,0.25))",
        }}
      />

      <div className="w-48 h-1 mt-6 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            background: "hsl(49 100% 54%)",
            animation: "flash-splash-bar 1.4s ease-out forwards",
            transformOrigin: "left",
          }}
        />
      </div>

      <p
        className="mt-4 text-white/40 text-xs tracking-[0.3em] uppercase"
        style={{
          animation: "flash-fade-in 0.5s 0.3s ease forwards",
          opacity: 0,
        }}
      >
        Heavy Equipment & Asset Management
      </p>
    </div>
  );
}
