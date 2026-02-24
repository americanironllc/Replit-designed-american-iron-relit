import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ClipboardCheck,
  ShieldCheck,
  Search,
  Truck,
  ArrowRight,
} from "lucide-react";
import { useFlashReveal } from "@/hooks/useFlashReveal";

const steps = [
  {
    icon: ClipboardCheck,
    title: "Technical Assessment & Planning",
    desc: "Every project begins with a rigorous evaluation of the asset. We identify core components - engines, transmissions, and hydraulic systems - that meet our strict criteria for recovery and resale.",
  },
  {
    icon: ShieldCheck,
    title: "Safe & Compliant Extraction",
    desc: "Our team operates under stringent safety protocols. We manage the removal of fluids and hazardous materials in accordance with environmental regulations, mitigating liability for our partners.",
  },
  {
    icon: Search,
    title: "Component Verification",
    desc: "Post-dismantling, every recovered part is cataloged, inspected, and prepared for our global inventory, ensuring only the most reliable components return to the supply chain.",
  },
  {
    icon: Truck,
    title: "Facility & Site Logistics",
    desc: "Whether at our specialized Florida facility or on-site at your location, we manage the entire logistical footprint of the dismantling project, including heavy-haul transport.",
  },
];

export default function ServiceDismantling() {
  const heroRef = useFlashReveal();
  const contentRef = useFlashReveal();
  const ctaRef = useFlashReveal();

  return (
    <div className="flash-page-transition">
      <section className="relative py-24 overflow-hidden" ref={heroRef}>
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url(/images/service-dismantling.png)" }} />
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/70 to-black/50" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl">
            <h1 className="flash-reveal text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight" data-testid="text-dismantling-title">
              Precision Industrial Dismantling & Asset Recovery
            </h1>
            <p className="flash-reveal text-white/70 text-lg leading-relaxed" style={{ "--flash-index": 1 } as any}>
              Professional decommissioning services designed to maximize salvage value while ensuring total regulatory compliance and safety.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16" ref={contentRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-5 gap-12">
            <div className="lg:col-span-2">
              <h2 className="flash-reveal text-2xl font-bold mb-4 tracking-tight">Service Overview</h2>
              <h3 className="flash-reveal text-lg font-semibold text-accent mb-4" style={{ "--flash-index": 1 } as any}>Strategic Decommissioning Solutions</h3>
              <p className="flash-reveal text-muted-foreground leading-relaxed" style={{ "--flash-index": 2 } as any}>
                American Iron LLC provides comprehensive dismantling services for heavy machinery across the construction, mining, and industrial sectors. Our approach combines technical engineering expertise with a deep understanding of component secondary markets. We don't just dismantle equipment; we meticulously recover high-value assets to ensure our clients realize the maximum return on their end-of-life machinery.
              </p>
            </div>
            <div className="lg:col-span-3">
              <h2 className="flash-reveal text-2xl font-bold mb-6 tracking-tight">The Enterprise Dismantling Framework</h2>
              <div className="space-y-4 flash-stagger">
                {steps.map((step, i) => (
                  <Card key={step.title} className="flash-reveal p-5 border-card-border" style={{ "--flash-index": i + 1 } as any}>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-md bg-accent/10 flex items-center justify-center shrink-0">
                        <step.icon className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1.5">
                          <span className="text-accent mr-2">{String(i + 1).padStart(2, "0")}</span>
                          {step.title}
                        </h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-card" ref={ctaRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="flash-reveal text-2xl font-bold mb-4">Get a Dismantling Consultation</h2>
          <p className="flash-reveal text-muted-foreground mb-8 max-w-xl mx-auto" style={{ "--flash-index": 1 } as any}>
            Contact our team to discuss your decommissioning requirements and receive a tailored proposal.
          </p>
          <div className="flash-reveal flex flex-wrap gap-4 justify-center" style={{ "--flash-index": 2 } as any}>
            <Link href="/contact">
              <Button className="bg-accent text-accent-foreground gap-2" size="lg" data-testid="button-contact-dismantling">
                Contact Us <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/quote">
              <Button variant="outline" size="lg" data-testid="button-quote-dismantling">
                Request Quote
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
