import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useFlashReveal } from "@/hooks/useFlashReveal";

const VIDEOS = [
  "/images/equip-bg-1.mp4",
  "/images/equip-bg-2.mp4",
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
        data-testid="equip-hero-video"
      >
        <source src={VIDEOS[activeIndex]} type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/45 to-black/25" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-black/10" />
    </>
  );
}

import telehandlerImg from "@assets/TELEHANDLER_1771680608848.png";
import asphaltPaversImg from "@assets/ASPHALT_PAVERS_1771680608848.png";
import offHighwayTrucksImg from "@assets/OFF-HIGHWAY_TRUCKS_1771680608848.png";
import forestryImg from "@assets/FORESTERY__1771680608848.jpeg";
import trackDozerImg from "@assets/track_dozer_1771680608848.png";
import scrapersImg from "@assets/Scrapers_1771680608848.png";
import skidsteerImg from "@assets/Skidsteer_1771680608848.png";
import wheelLoadersImg from "@assets/Wheel_Loaders_1771680608848.jpg";
import motorGradersImg from "@assets/Motor_Graders_1771680608848.png";
import compactorsImg from "@assets/Compactors_1771680608848.png";
import excavatorsImg from "@assets/Excavators_1771680608848.png";
import bulldozersImg from "@assets/Bulldozers_1771680608848.png";
import backhoeImg from "@assets/backhoe_1771680608848.png";
import articulatedTruckImg from "@assets/Articulated_truck_1771680608848.png";
import coldPlanerImg from "@assets/Cold_Planer_1771680608848.png";

const EQUIPMENT_CATEGORIES = [
  { name: "EXCAVATORS", label: "Excavators", image: excavatorsImg },
  { name: "BULLDOZERS", label: "Bulldozers", image: bulldozersImg },
  { name: "WHEEL LOADERS", label: "Wheel Loaders", image: wheelLoadersImg },
  { name: "ARTICULATED TRUCKS", label: "Articulated Trucks", image: articulatedTruckImg },
  { name: "MOTOR GRADERS", label: "Motor Graders", image: motorGradersImg },
  { name: "SCRAPERS", label: "Scrapers", image: scrapersImg },
  { name: "TELEHANDLERS", label: "Telehandlers", image: telehandlerImg },
  { name: "TRACK DOZERS", label: "Track Dozers", image: trackDozerImg },
  { name: "SKIDSTEER", label: "Skid Steers", image: skidsteerImg },
  { name: "BACKHOES", label: "Backhoes", image: backhoeImg },
  { name: "OFF-HIGHWAY TRUCKS", label: "Off-Highway Trucks", image: offHighwayTrucksImg },
  { name: "COMPACTORS", label: "Compactors", image: compactorsImg },
  { name: "COLD PLANERS", label: "Cold Planers", image: coldPlanerImg },
  { name: "ASPHALT PAVERS", label: "Asphalt Pavers", image: asphaltPaversImg },
  { name: "FORESTRY EQUIPMENT", label: "Forestry Equipment", image: forestryImg },
  { name: "OTHER EQUIPMENT", label: "Other Equipment", image: null },
];

export default function EquipmentCategories() {
  const { data: counts } = useQuery<Record<string, number>>({
    queryKey: ["/api/equipment/categories/counts"],
  });

  const totalItems = counts ? Object.values(counts).reduce((a, b) => a + b, 0) : 0;

  const heroRef = useFlashReveal();
  const gridRef = useFlashReveal();

  return (
    <div className="flash-page-transition">
      <section className="relative py-24 overflow-hidden bg-black" ref={heroRef}>
        <RotatingVideoBackground />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
          <h1 className="flash-reveal text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight" data-testid="text-page-title">
            Equipment Categories
          </h1>
          <p className="flash-reveal text-white/70 text-lg max-w-2xl" style={{ "--flash-index": 1 } as any}>
            Browse our comprehensive inventory of {totalItems > 0 ? `${totalItems.toLocaleString()}+` : ""} pieces of heavy equipment across all major categories.
          </p>
        </div>
      </section>

      <section className="py-12" ref={gridRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 flash-stagger">
            {EQUIPMENT_CATEGORIES.map((cat, i) => (
              <Link
                key={cat.name}
                href={`/equipment/listings?category=${encodeURIComponent(cat.name)}`}
              >
                <Card
                  className="flash-reveal-scale group overflow-visible hover-elevate cursor-pointer border-card-border h-full"
                  style={{ "--flash-index": i } as any}
                  data-testid={`card-category-${cat.name.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <div className="aspect-[16/10] relative rounded-t-md overflow-hidden bg-muted">
                    {cat.image ? (
                      <img
                        src={cat.image}
                        alt={cat.label}
                        className="w-full h-full object-contain bg-white transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-card flex items-center justify-center">
                        <Wrench className="w-16 h-16 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>
                  <div className="p-5 flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-lg">{cat.label}</h3>
                      {counts && counts[cat.name] && (
                        <span className="text-sm text-muted-foreground">{counts[cat.name].toLocaleString()} items</span>
                      )}
                    </div>
                    <ArrowRight className="w-5 h-5 text-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link href="/equipment/listings">
              <Button size="lg" className="bg-accent text-accent-foreground gap-2 text-base px-8" data-testid="button-view-all-equipment">
                View All Equipment
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
