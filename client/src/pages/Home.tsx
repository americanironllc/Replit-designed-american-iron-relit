import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ArrowRight,
  Wrench,
  Search,
  Truck,
  Ship,
  Shield,
  Globe,
  Zap,
  Users,
  ChevronRight,
  Package,
  Settings,
  HardHat,
  Cog,
  CircleDot,
  BarChart3,
} from "lucide-react";
import { useFlashReveal } from "@/hooks/useFlashReveal";

const categories = [
  "Wheel Loaders", "Excavators", "Bulldozers", "Telehandlers",
  "Motor Graders", "Articulated Trucks", "Scrapers", "Compactors",
];

const services = [
  {
    icon: Wrench,
    title: "Industrial Dismantling",
    desc: "Professional salvage and dismantling operations with maximum component recovery.",
    href: "/services/dismantling",
    image: "/images/service-dismantling.png",
  },
  {
    icon: Search,
    title: "Technical Inspection",
    desc: "Rigorous field inspections and data-driven reporting for asset integrity.",
    href: "/services/inspection",
    image: "/images/service-inspection.png",
  },
  {
    icon: Truck,
    title: "Transportation",
    desc: "Seamless domestic haulage and heavy-haul coordination across North America.",
    href: "/services/transportation",
    image: "/images/service-transport.png",
  },
  {
    icon: Ship,
    title: "Shipping & Forwarding",
    desc: "Expert freight forwarding and customs documentation for global delivery.",
    href: "/services/shipping",
    image: "/images/service-shipping.png",
  },
];

const stats = [
  { value: "2,100+", label: "Equipment Listed", icon: HardHat },
  { value: "12,200+", label: "Parts in Catalog", icon: Cog },
  { value: "15+", label: "Equipment Categories", icon: CircleDot },
  { value: "Global", label: "Shipping Network", icon: Globe },
];

const valueProps = [
  {
    icon: Shield,
    title: "Market-Leading Expertise",
    desc: "Our veteran team leverages decades of industry data to source high-performance equipment and rare components nationwide.",
  },
  {
    icon: Zap,
    title: "Operational Efficiency",
    desc: "A streamlined procurement platform designed for rapid response, ensuring your projects remain on schedule and within budget.",
  },
  {
    icon: Globe,
    title: "Global Scalability",
    desc: "From our strategic headquarters in Florida, we offer comprehensive logistical support to deploy assets to job sites across the globe.",
  },
  {
    icon: Users,
    title: "Integrity-Driven Partnership",
    desc: "We prioritize long-term professional relationships built on transparency, technical excellence, and consistent delivery.",
  },
];

export default function Home() {
  const heroRef = useFlashReveal();
  const statsRef = useFlashReveal();
  const capabilitiesRef = useFlashReveal();
  const servicesRef = useFlashReveal();
  const browseRef = useFlashReveal();
  const valueRef = useFlashReveal();
  const ctaRef = useFlashReveal();

  return (
    <div className="flash-page-transition">
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-black" style={{ WebkitTransform: "translateZ(0)" }}>
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url(/images/hero-equipment.png)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        <div ref={heroRef} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-20 w-full">
          <div className="max-w-3xl">
            <div className="flash-reveal inline-flex items-center gap-2 bg-accent/20 border border-accent/30 rounded-full px-4 py-1.5 mb-6">
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
              <span className="text-accent text-sm font-medium">
                Tampa, FL | Global Operations
              </span>
            </div>

            <h1 className="flash-reveal text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-[1.1] tracking-tight mb-6" style={{ "--flash-index": 1 } as any}>
              Heavy Equipment &{" "}
              <span className="text-accent-glow">Asset Management</span>{" "}
              Solutions
            </h1>

            <p className="flash-reveal text-lg sm:text-xl text-white/70 max-w-2xl mb-10 leading-relaxed" style={{ "--flash-index": 2 } as any}>
              Empowering global infrastructure through comprehensive parts
              inventory, and unparalleled equipment procurement.
            </p>

            <div className="flash-reveal flex flex-wrap gap-4" style={{ "--flash-index": 3 } as any}>
              <Link href="/equipment">
                <Button size="lg" className="bg-accent text-accent-foreground gap-2 text-base px-8" data-testid="button-explore-equipment">
                  Explore Equipment
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/parts">
                <Button size="lg" variant="outline" className="text-white border-white/30 bg-white/10 backdrop-blur gap-2 text-base px-8" data-testid="button-explore-parts">
                  Industrial Parts
                  <Package className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
      </section>

      <section className="py-4 -mt-12 relative z-20 section-divider pb-16" ref={statsRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 flash-stagger">
            {stats.map((stat, i) => (
              <Card
                key={stat.label}
                className="flash-reveal-scale p-6 text-center border-card-border relative overflow-hidden"
                style={{ "--flash-index": i } as any}
                data-testid={`stat-${stat.label.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <div className="absolute top-3 right-3 opacity-[0.07]">
                  <stat.icon className="w-16 h-16" />
                </div>
                <div className="relative">
                  <div className="text-2xl sm:text-3xl font-bold text-accent-3d mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 section-stripe-bg border-y border-border/50" ref={capabilitiesRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <div className="flash-reveal inline-flex items-center gap-2 mb-4">
              <div className="h-px w-8 bg-accent" />
              <span className="text-accent text-sm font-semibold tracking-widest uppercase">What We Do</span>
              <div className="h-px w-8 bg-accent" />
            </div>
            <h2 className="flash-reveal text-3xl sm:text-4xl font-bold mb-4 tracking-tight" style={{ "--flash-index": 1 } as any}>
              Core <span className="text-accent-3d">Capabilities</span>
            </h2>
            <p className="flash-reveal text-muted-foreground max-w-2xl mx-auto text-lg" style={{ "--flash-index": 2 } as any}>
              From acquisition to end-of-life recovery, end-to-end support for your heavy machinery investments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 flash-stagger">
            {[
              { icon: Settings, title: "Asset Inventory Management", desc: "Optimize your fleet with our meticulously vetted inventory. Filter by manufacturer, specification, and operational history.", href: "/equipment", testId: "card-asset-inventory" },
              { icon: Package, title: "Global Parts Distribution", desc: "Minimize downtime with immediate access to our extensive component database for mission-critical machinery.", href: "/parts", testId: "card-parts-distribution" },
              { icon: Search, title: "Strategic Consultations & Quotes", desc: "Receive comprehensive, transparent quotes for equipment procurement or specialized component sourcing.", href: "/quote", testId: "card-consultations" },
              { icon: Globe, title: "Global Reach", desc: "From our Florida hub, we deploy assets and parts to job sites worldwide with expert logistics coordination.", href: "/contact", testId: "card-contact" },
            ].map((cap, i) => (
              <Link key={cap.href} href={cap.href}>
                <div
                  className="flash-reveal-scale flip-card h-48"
                  style={{ "--flash-index": i } as any}
                  data-testid={cap.testId}
                >
                  <div className="flip-card-inner">
                    <div className="flip-card-front bg-background border border-card-border rounded-md flex items-center gap-4 p-6">
                      <div className="w-12 h-12 rounded-md bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
                        <cap.icon className="w-6 h-6 text-accent" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{cap.title}</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed mt-1">{cap.desc}</p>
                      </div>
                    </div>
                    <div className="flip-card-back flex flex-col items-center justify-center gap-3 bg-accent border border-accent rounded-md p-8">
                      <div className="w-14 h-14 rounded-md bg-accent-foreground/10 flex items-center justify-center">
                        <cap.icon className="w-7 h-7 text-accent-foreground" />
                      </div>
                      <h3 className="font-bold text-lg text-accent-foreground text-center">{cap.title}</h3>
                      <span className="inline-flex items-center gap-1 text-accent-foreground font-semibold text-sm">
                        Explore <ChevronRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-card relative overflow-hidden" ref={servicesRef}>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
        <div className="absolute -top-32 -right-32 w-64 h-64 rounded-full bg-accent/[0.03] blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-64 h-64 rounded-full bg-accent/[0.03] blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
          <div className="text-center mb-14">
            <div className="flash-reveal inline-flex items-center gap-2 mb-4">
              <div className="h-px w-8 bg-accent" />
              <span className="text-accent text-sm font-semibold tracking-widest uppercase">Our Services</span>
              <div className="h-px w-8 bg-accent" />
            </div>
            <h2 className="flash-reveal text-3xl sm:text-4xl font-bold mb-4 tracking-tight" style={{ "--flash-index": 1 } as any}>
              Integrated <span className="text-accent-3d">Lifecycle</span> Services
            </h2>
            <p className="flash-reveal text-muted-foreground max-w-2xl mx-auto text-lg" style={{ "--flash-index": 2 } as any}>
              Comprehensive support from acquisition to end-of-life recovery.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 flash-stagger">
            {services.map((svc, i) => (
              <Link key={svc.href} href={svc.href}>
                <div
                  className="flash-reveal-scale flip-card h-64 sm:h-80"
                  style={{ "--flash-index": i } as any}
                  data-testid={`card-service-${svc.href.split("/").pop()}`}
                >
                  <div className="flip-card-inner">
                    <div className="flip-card-front bg-background border border-card-border rounded-md">
                      <div className="h-[60%] relative overflow-hidden rounded-t-md">
                        <img
                          src={svc.image}
                          alt={svc.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        <div className="absolute bottom-3 left-3">
                          <div className="w-9 h-9 rounded-md bg-accent/90 flex items-center justify-center">
                            <svc.icon className="w-4.5 h-4.5 text-accent-foreground" />
                          </div>
                        </div>
                      </div>
                      <div className="p-5">
                        <h3 className="font-semibold text-base">{svc.title}</h3>
                      </div>
                    </div>
                    <div className="flip-card-back flex flex-col items-center justify-center gap-4 bg-accent border border-accent p-8">
                      <div className="w-12 h-12 rounded-md bg-accent-foreground/10 flex items-center justify-center">
                        <svc.icon className="w-6 h-6 text-accent-foreground" />
                      </div>
                      <h3 className="font-bold text-lg text-accent-foreground text-center">{svc.title}</h3>
                      <p className="text-accent-foreground/80 text-sm leading-relaxed text-center">
                        {svc.desc}
                      </p>
                      <span className="inline-flex items-center gap-1 text-accent-foreground font-semibold text-sm mt-1">
                        Learn More <ChevronRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 section-dot-bg border-y border-border/50 relative" ref={browseRef}>
        <div className="absolute top-8 right-8 opacity-[0.04] hidden lg:block">
          <BarChart3 className="w-48 h-48" />
        </div>
        <div className="absolute bottom-8 left-8 opacity-[0.04] hidden lg:block">
          <HardHat className="w-40 h-40" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="flash-reveal-left">
              <div className="inline-flex items-center gap-2 mb-4">
                <div className="h-px w-8 bg-accent" />
                <span className="text-accent text-sm font-semibold tracking-widest uppercase">Inventory</span>
                <div className="h-px w-8 bg-accent" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight">
                Browse <span className="text-accent-3d">Equipment</span> Categories
              </h2>
              <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                We maintain a comprehensive inventory of over 2,100 pieces of heavy equipment across all major categories.
              </p>
              <div className="flex flex-wrap gap-2 mb-8">
                {categories.map((cat) => (
                  <Link key={cat} href={`/equipment/listings?category=${encodeURIComponent(cat.toUpperCase())}`}>
                    <span className="inline-flex items-center px-4 py-2 rounded-md bg-card border border-card-border text-sm font-medium cursor-pointer hover-elevate transition-colors hover:border-accent/40" data-testid={`badge-category-${cat.toLowerCase().replace(/\s+/g, "-")}`}>
                      {cat}
                    </span>
                  </Link>
                ))}
              </div>
              <Link href="/equipment">
                <Button className="bg-accent text-accent-foreground gap-2" data-testid="button-view-all-equipment">
                  View All Equipment
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            <div className="flash-reveal-right relative">
              <div className="absolute -inset-4 bg-accent/5 rounded-lg -z-10" />
              <div className="aspect-[4/3] rounded-md overflow-hidden border border-card-border shadow-lg">
                <img
                  src="/images/hero-about.png"
                  alt="Heavy equipment fleet"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-accent text-accent-foreground p-4 rounded-md shadow-lg border border-accent/80">
                <div className="text-2xl font-bold">2,131</div>
                <div className="text-sm font-medium">Active Listings</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-primary text-primary-foreground relative overflow-hidden" ref={valueRef}>
        <div className="absolute inset-0 section-stripe-bg opacity-50" />
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent/50 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
          <div className="text-center mb-14">
            <div className="flash-reveal inline-flex items-center gap-2 mb-4">
              <div className="h-px w-8 bg-accent" />
              <span className="text-accent text-sm font-semibold tracking-widest uppercase">Why Choose Us</span>
              <div className="h-px w-8 bg-accent" />
            </div>
            <h2 className="flash-reveal text-3xl sm:text-4xl font-bold mb-4 tracking-tight" style={{ "--flash-index": 1 } as any}>
              Value <span className="text-accent-glow">Proposition</span>
            </h2>
            <p className="flash-reveal text-primary-foreground/70 max-w-2xl mx-auto text-lg" style={{ "--flash-index": 2 } as any}>
              Why industry leaders trust American Iron LLC as their primary equipment partner.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 flash-stagger">
            {valueProps.map((vp, i) => (
              <div
                key={vp.title}
                className="flash-reveal flip-card h-44"
                style={{ "--flash-index": i } as any}
                data-testid={`value-${vp.title.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <div className="flip-card-inner">
                  <div className="flip-card-front flex flex-col items-center justify-center gap-4 bg-white/[0.04] backdrop-blur-sm border border-white/[0.08] p-6">
                    <div className="w-14 h-14 rounded-md bg-accent/20 border border-accent/30 flex items-center justify-center">
                      <vp.icon className="w-7 h-7 text-accent" />
                    </div>
                    <h3 className="font-semibold text-lg text-center">{vp.title}</h3>
                  </div>
                  <div className="flip-card-back flex flex-col items-center justify-center gap-3 bg-accent/90 border border-accent p-6">
                    <h3 className="font-bold text-base text-accent-foreground text-center">{vp.title}</h3>
                    <p className="text-accent-foreground/80 text-sm leading-relaxed text-center">
                      {vp.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-card relative overflow-hidden" ref={ctaRef}>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
        <div className="absolute inset-0 section-dot-bg opacity-50" />
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-accent/[0.04] blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center relative">
          <div className="flash-reveal inline-flex items-center gap-2 mb-4">
            <div className="h-px w-8 bg-accent" />
            <span className="text-accent text-sm font-semibold tracking-widest uppercase">Get In Touch</span>
            <div className="h-px w-8 bg-accent" />
          </div>
          <h2 className="flash-reveal text-3xl sm:text-4xl font-bold mb-4 tracking-tight" style={{ "--flash-index": 1 } as any}>
            Ready to <span className="text-accent-3d">Get Started</span>?
          </h2>
          <p className="flash-reveal text-muted-foreground text-lg mb-8 max-w-2xl mx-auto" style={{ "--flash-index": 2 } as any}>
            Contact our asset specialists for equipment acquisition, parts procurement, and specialized industrial services.
          </p>
          <div className="flash-reveal flex flex-wrap gap-4 justify-center" style={{ "--flash-index": 3 } as any}>
            <Link href="/quote">
              <Button size="lg" className="bg-accent text-accent-foreground gap-2 text-base px-8" data-testid="button-cta-quote">
                Request a Quote
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="gap-2 text-base px-8" data-testid="button-cta-contact">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
