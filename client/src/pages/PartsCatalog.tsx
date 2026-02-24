import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowRight, Search, Package, Wrench } from "lucide-react";
import { useFlashReveal } from "@/hooks/useFlashReveal";

const VIDEOS = [
  "/images/parts-bg-1.mp4",
  "/images/parts-bg-2.mp4",
  "/images/parts-bg-3.mp4",
];

const CATEGORY_IMAGES: Record<string, string> = {
  "Air Inlet & Exhaust": "/images/parts/air-inlet-exhaust.png",
  "Turbochargers": "/images/parts/turbochargers.png",
  "Bearings": "/images/parts/bearings.png",
  "Belts & Hoses": "/images/parts/belts-hoses.png",
  "Braking & Friction": "/images/parts/braking-friction.png",
  "Cooling System": "/images/parts/cooling-system.png",
  "Electrical": "/images/parts/electrical.png",
  "Engine Components": "/images/parts/engine-components.png",
  "Filters": "/images/parts/filters.png",
  "Ground Engaging Tools": "/images/parts/ground-engaging.png",
  "Hardware": "/images/parts/hardware.png",
  "Hydraulic System": "/images/parts/hydraulic-system.png",
  "Gaskets & Seals": "/images/parts/gaskets-seals.png",
  "Undercarriage": "/images/parts/undercarriage.png",
};

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  "Air Inlet & Exhaust": "Manifolds, pipes, clamps, and exhaust system components.",
  "Turbochargers": "Turbochargers, cartridges, and boost system parts.",
  "Bearings": "Ball, roller, tapered, needle bearings and bushings.",
  "Belts & Hoses": "V-belts, serpentine belts, and hydraulic hoses.",
  "Braking & Friction": "Brake shoes, pads, linings, and friction materials.",
  "Cooling System": "Radiators, water pumps, oil coolers, and thermostats.",
  "Electrical": "Alternators, starters, sensors, and wiring harnesses.",
  "Engine Components": "Pistons, heads, connecting rods, and engine internals.",
  "Filters": "Oil, fuel, air, and hydraulic filters for all equipment.",
  "Ground Engaging Tools": "Bucket teeth, cutting edges, adapters, and wear parts.",
  "Hardware": "Bolts, nuts, rod ends, grease fittings, and fasteners.",
  "Hydraulic System": "Pumps, cylinders, valves, gears, and hose assemblies.",
  "Gaskets & Seals": "Gasket kits, O-rings, and sealing components.",
  "Undercarriage": "Track chains, rollers, idlers, sprockets, and pads.",
};

const CATEGORY_ORDER = [
  "Hydraulic System",
  "Engine Components",
  "Bearings",
  "Undercarriage",
  "Filters",
  "Electrical",
  "Ground Engaging Tools",
  "Belts & Hoses",
  "Braking & Friction",
  "Hardware",
  "Cooling System",
  "Turbochargers",
  "Air Inlet & Exhaust",
  "Gaskets & Seals",
];

function RotatingVideoBackground() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [fadingOut, setFadingOut] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const nextIndexRef = useRef(1);

  const handleVideoEnd = useCallback(() => {
    setFadingOut(true);
    setTimeout(() => {
      setActiveIndex(nextIndexRef.current);
      nextIndexRef.current = (nextIndexRef.current + 1) % VIDEOS.length;
      setFadingOut(false);
    }, 600);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.load();
    video.play().catch(() => {});
  }, [activeIndex]);

  return (
    <>
      <video
        ref={videoRef}
        key={activeIndex}
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
        style={{ opacity: fadingOut ? 0 : 1 }}
        muted
        playsInline
        onEnded={handleVideoEnd}
        data-testid="parts-hero-video"
      >
        <source src={VIDEOS[activeIndex]} type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/45 to-black/25" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-black/10" />
    </>
  );
}

export default function PartsCatalog() {
  const { data: counts } = useQuery<Record<string, number>>({
    queryKey: ["/api/parts/categories/counts"],
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [, setLocation] = useLocation();

  const totalItems = counts ? Object.values(counts).reduce((a, b) => a + b, 0) : 0;

  const sortedCategories = CATEGORY_ORDER.filter((cat) => !counts || counts[cat]);

  const heroRef = useFlashReveal();
  const gridRef = useFlashReveal();

  return (
    <div className="flash-page-transition">
      <section className="relative py-24 overflow-hidden bg-black" ref={heroRef}>
        <RotatingVideoBackground />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-black" />
            </div>
            <span className="text-white/60 text-sm font-medium uppercase tracking-wider">Industrial Parts</span>
          </div>
          <h1 className="flash-reveal text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight" data-testid="text-parts-title">
            Parts <span className="text-accent-3d">Catalog</span>
          </h1>
          <p className="flash-reveal text-white/70 text-lg max-w-2xl mb-6" style={{ "--flash-index": 1 } as any}>
            Browse our complete inventory of{" "}
            <span className="text-accent font-semibold">
              {totalItems > 0 ? totalItems.toLocaleString() : "17,500"}+
            </span>{" "}
            aftermarket parts across {sortedCategories.length} categories.
          </p>

          <div className="flash-reveal flex flex-col sm:flex-row gap-3 mb-8" style={{ "--flash-index": 2 } as any}>
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
              <Input
                placeholder="Search by part number, description, or equipment..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && searchTerm.trim()) {
                    setLocation(`/parts/all?search=${encodeURIComponent(searchTerm.trim())}`);
                  }
                }}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:bg-white/15"
                data-testid="input-hero-search-parts"
              />
            </div>
            <Link href="/parts/all">
              <Button className="bg-accent text-accent-foreground gap-2 h-10" data-testid="button-view-all-parts">
                View All Parts
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/quote">
              <Button variant="outline" className="text-white border-white/30 bg-white/10 backdrop-blur gap-2 h-10" data-testid="button-request-quote">
                <Wrench className="w-4 h-4" />
                Request Quote
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap gap-6 text-sm">
            <div className="text-white/60">
              <span className="text-2xl font-bold text-white">{sortedCategories.length}</span> Categories
            </div>
            <div className="text-white/60">
              <span className="text-2xl font-bold text-accent">{totalItems > 0 ? totalItems.toLocaleString() : "17,500"}+</span> Parts
            </div>
            <div className="text-white/60">
              <span className="text-2xl font-bold text-white">100%</span> Aftermarket
            </div>
          </div>
        </div>
      </section>

      <section className="py-12" ref={gridRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="flash-reveal text-2xl font-bold tracking-tight">Browse by Category</h2>
              <p className="text-muted-foreground mt-1">
                Select a category to explore parts and build your quote.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 flash-stagger">
            {sortedCategories.map((cat, i) => {
              const count = counts?.[cat] || 0;
              const slug = encodeURIComponent(cat);
              return (
                <Link key={cat} href={`/parts/${slug}`}>
                  <Card
                    className="flash-reveal-scale group overflow-hidden hover-elevate cursor-pointer border-card-border h-full"
                    style={{ "--flash-index": i } as any}
                    data-testid={`card-parts-${cat.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    <div className="aspect-[16/9] relative overflow-hidden bg-black">
                      <img
                        src={CATEGORY_IMAGES[cat] || "/images/parts/generic-part.png"}
                        alt={cat}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                      <div className="absolute bottom-3 left-4 right-4">
                        <h3 className="font-bold text-white text-base">{cat}</h3>
                      </div>
                      {count > 0 && (
                        <div className="absolute top-3 right-3 bg-accent text-black text-xs font-bold px-2 py-1 rounded">
                          {count.toLocaleString()}
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                        {CATEGORY_DESCRIPTIONS[cat] || "Browse parts in this category."}
                      </p>
                      <div className="flex items-center text-xs text-accent font-medium group-hover:underline">
                        Browse Parts <ArrowRight className="w-3 h-3 ml-1" />
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>

          <div className="mt-12 text-center">
            <Link href="/parts/all">
              <Button size="lg" className="bg-accent text-accent-foreground gap-2 text-base px-8" data-testid="button-view-all-parts-bottom">
                View All {totalItems > 0 ? totalItems.toLocaleString() : "17,500"}+ Parts
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
