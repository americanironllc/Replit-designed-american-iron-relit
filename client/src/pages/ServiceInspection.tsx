import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Eye,
  Fingerprint,
  Camera,
  CheckCircle,
  Shield,
  Users,
  Globe,
  Award,
  ArrowRight,
} from "lucide-react";
import { useFlashReveal } from "@/hooks/useFlashReveal";

const inspectionCapabilities = [
  {
    icon: Eye,
    title: "Visual Condition Auditing",
    desc: "A detailed macroscopic analysis of structural integrity, hydraulic systems, and powertrain components to identify wear patterns or potential points of failure.",
  },
  {
    icon: Fingerprint,
    title: "Serial & Telemetry Verification",
    desc: "Rigorous authentication of VIN/Serial data and meter readings to ensure accurate asset aging and maintenance history reporting.",
  },
  {
    icon: Camera,
    title: "Multimedia Documentation",
    desc: "High-resolution photographic evidence and video diagnostics that capture the equipment in operational states, providing a virtual walk-around for remote stakeholders.",
  },
  {
    icon: CheckCircle,
    title: "Pre-Shipment Compliance Checks",
    desc: "A final technical verification prior to mobilization to ensure all components are secured and asset condition aligns with the finalized sales agreement.",
  },
];

const advantages = [
  { icon: Shield, title: "Operational Transparency", desc: "Granular level of detail for data-backed procurement decisions." },
  { icon: Users, title: "Neutral Third-Party Oversight", desc: "Objective perspective protecting your capital from unforeseen liabilities." },
  { icon: Globe, title: "Geographic Flexibility", desc: "Rapid deployment from Florida's logistics hub, reducing acquisition timelines." },
  { icon: Award, title: "Global Standards", desc: "Protocols designed for international dealers and large-scale contractors." },
];

export default function ServiceInspection() {
  const heroRef = useFlashReveal();
  const contentRef = useFlashReveal();
  const advantagesRef = useFlashReveal();
  const ctaRef = useFlashReveal();

  return (
    <div className="flash-page-transition">
      <section className="relative py-24 overflow-hidden" ref={heroRef}>
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url(/images/service-inspection.png)" }} />
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/70 to-black/50" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl">
            <h1 className="flash-reveal text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight" data-testid="text-inspection-title">
              Technical Inspection & Asset Verification Services
            </h1>
            <p className="flash-reveal text-white/70 text-lg leading-relaxed" style={{ "--flash-index": 1 } as any}>
              Providing the data-driven insights and rigorous due diligence required for confident industrial acquisitions.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16" ref={contentRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mb-12">
            <h2 className="flash-reveal text-2xl font-bold mb-4 tracking-tight">Service Overview</h2>
            <h3 className="flash-reveal text-lg font-semibold text-accent mb-4" style={{ "--flash-index": 1 } as any}>Mitigation of Risk Through Technical Oversight</h3>
            <p className="flash-reveal text-muted-foreground leading-relaxed" style={{ "--flash-index": 2 } as any}>
              In the global heavy equipment market, transparency is the foundation of every successful transaction. American Iron LLC provides comprehensive inspection services designed to eliminate uncertainty for buyers, sellers, and fleet managers. Our technical evaluations provide a clear, unbiased assessment of asset health, ensuring that every piece of machinery meets your operational requirements and safety standards.
            </p>
          </div>

          <h2 className="flash-reveal text-2xl font-bold mb-6 tracking-tight">Comprehensive Audit Capabilities</h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-16 flash-stagger">
            {inspectionCapabilities.map((cap, i) => (
              <Card key={cap.title} className="flash-reveal-scale p-5 border-card-border" style={{ "--flash-index": i } as any}>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-md bg-accent/10 flex items-center justify-center shrink-0">
                    <cap.icon className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1.5">{cap.title}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{cap.desc}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section ref={advantagesRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
          <h2 className="flash-reveal text-2xl font-bold mb-6 tracking-tight">The Enterprise Advantage</h2>
          <div className="grid sm:grid-cols-2 gap-6 flash-stagger">
            {advantages.map((adv, i) => (
              <div key={adv.title} className="flash-reveal-left flex items-start gap-3" style={{ "--flash-index": i } as any}>
                <div className="w-9 h-9 rounded-md bg-accent/10 flex items-center justify-center shrink-0">
                  <adv.icon className="w-4.5 h-4.5 text-accent" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-1">{adv.title}</h4>
                  <p className="text-sm text-muted-foreground">{adv.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-card" ref={ctaRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="flash-reveal text-2xl font-bold mb-4">Schedule an Inspection</h2>
          <p className="flash-reveal text-muted-foreground mb-8 max-w-xl mx-auto" style={{ "--flash-index": 1 } as any}>
            Contact us to arrange a comprehensive technical inspection for your equipment acquisition.
          </p>
          <div className="flash-reveal flex flex-wrap gap-4 justify-center" style={{ "--flash-index": 2 } as any}>
            <Link href="/contact">
              <Button className="bg-accent text-accent-foreground gap-2" size="lg" data-testid="button-contact-inspection">
                Contact Us <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/quote">
              <Button variant="outline" size="lg">Request Quote</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
