import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, ArrowRight, Zap, Gauge, Calendar, ChevronRight, ChevronLeft, DollarSign, Clock, Fuel, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { PowerUnit } from "@shared/schema";
import { useFlashReveal } from "@/hooks/useFlashReveal";

import marineEnginesImg from "@/assets/images/marine-engines.png";
import generatorSetsImg from "@/assets/images/generator-sets.png";
import powerUnitsImg from "@/assets/images/power-units-cat.png";
import industrialGeneratorsImg from "@/assets/images/industrial-generators.png";

const CATEGORY_VIDEOS: Record<string, string[]> = {
  "Generator Sets": ["/images/power-bg-1.mp4", "/images/power-bg-2.mp4"],
  "Marine Engines": ["/images/power-marine-bg.mp4", "/images/power-bg-1.mp4"],
  "Power Units": ["/images/power-units-bg.mp4", "/images/power-bg-2.mp4"],
  "Industrial Engines": ["/images/power-industrial-bg.mp4", "/images/power-bg-1.mp4"],
};

const DEFAULT_VIDEOS = ["/images/power-bg-1.mp4", "/images/power-bg-2.mp4"];

function RotatingVideoBackground({ category }: { category: string }) {
  const videos = CATEGORY_VIDEOS[category] || DEFAULT_VIDEOS;
  const [activeIndex, setActiveIndex] = useState(0);
  const [fadingOut, setFadingOut] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const nextIndexRef = useRef(1);

  const handleVideoEnd = useCallback(() => {
    setFadingOut(true);
    setTimeout(() => {
      setActiveIndex(prev => {
        const next = (prev + 1) % videos.length;
        nextIndexRef.current = (next + 1) % videos.length;
        return next;
      });
      setFadingOut(false);
    }, 600);
  }, [videos.length]);

  useEffect(() => {
    setActiveIndex(0);
    nextIndexRef.current = 1;
  }, [category]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.load();
    video.play().catch(() => {});
  }, [activeIndex, category]);

  return (
    <>
      <video
        ref={videoRef}
        key={`${category}-${activeIndex}`}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: fadingOut ? 0 : 0.45, transition: "opacity 0.6s ease-in-out" }}
        muted
        playsInline
        onEnded={handleVideoEnd}
        data-testid="video-listings-bg"
      >
        <source src={videos[activeIndex]} type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
    </>
  );
}

const CATEGORY_IMAGES: Record<string, string> = {
  "Generator Sets": generatorSetsImg,
  "Marine Engines": marineEnginesImg,
  "Power Units": powerUnitsImg,
  "Industrial Engines": industrialGeneratorsImg,
};

const CATEGORIES = ["Generator Sets", "Marine Engines", "Power Units", "Industrial Engines"];

export default function PowerUnitsListings() {
  const [location] = useLocation();
  const searchStr = typeof window !== "undefined" ? window.location.search : "";
  const params = new URLSearchParams(searchStr);
  const initialCategory = params.get("category") || "";

  const [category, setCategory] = useState(initialCategory);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 24;

  useEffect(() => {
    const urlParams = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
    const urlCategory = urlParams.get("category") || "";
    if (urlCategory !== category) {
      setCategory(urlCategory);
    }
  }, [location, searchStr]);

  useEffect(() => {
    setPage(1);
  }, [category, search]);

  const queryString = new URLSearchParams({
    ...(category && { category }),
    ...(search && { search }),
    page: String(page),
    limit: String(limit),
  }).toString();

  const { data, isLoading } = useQuery<{ items: PowerUnit[]; total: number }>({
    queryKey: [`/api/power-units?${queryString}`],
  });

  const items = data?.items || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  const heroRef = useFlashReveal();
  const gridRef = useFlashReveal();

  return (
    <div className="flash-page-transition">
      <section className="relative py-16 overflow-hidden bg-black" ref={heroRef}>
        <RotatingVideoBackground category={category} />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 text-sm text-white/60 mb-4">
            <Link href="/power-units" className="hover:text-accent transition-colors" data-testid="link-power-units-home">Power Units & Generators</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-white">{category || "All Listings"}</span>
          </div>
          <h1 className="flash-reveal text-3xl sm:text-4xl font-bold text-white mb-2 tracking-tight" data-testid="text-page-title">
            {category || "All Power Units & Generators"}
          </h1>
          <p className="flash-reveal text-white/60 text-base" style={{ "--flash-index": 1 } as any}>
            {total > 0 ? `${total} unit${total !== 1 ? "s" : ""} available` : "Loading inventory..."}
          </p>
        </div>
      </section>

      <section className="py-8" ref={gridRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by model, stock number..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                data-testid="input-search"
              />
            </div>
            <Select value={category} onValueChange={(v) => setCategory(v === "all" ? "" : v)}>
              <SelectTrigger className="w-full sm:w-[220px]" data-testid="select-category">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="aspect-[16/10] w-full" />
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                </Card>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <Zap className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg">No units found matching your criteria.</p>
              <Button variant="outline" className="mt-4" onClick={() => { setSearch(""); setCategory(""); }} data-testid="button-clear-filters">
                Clear Filters
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 flash-stagger">
                {items.map((item, i) => (
                  <Card
                    key={item.id}
                    className="flash-reveal-scale group overflow-visible hover-elevate border-card-border"
                    style={{ "--flash-index": i % 12 } as any}
                    data-testid={`card-power-unit-${item.id}`}
                  >
                    <div className="aspect-[16/10] relative rounded-t-md overflow-hidden bg-muted">
                      <img
                        src={item.imageUrl || CATEGORY_IMAGES[item.category] || powerUnitsImg}
                        alt={item.model}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="bg-accent text-accent-foreground text-xs font-bold px-2 py-1 rounded">{item.category}</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-base mb-1 line-clamp-1" data-testid={`text-model-${item.id}`}>{item.model}</h3>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {item.condition && item.condition !== 'N/A' && (
                          <Badge variant="secondary" className="text-[10px] font-medium" data-testid={`badge-condition-${item.id}`}>
                            <Shield className="w-2.5 h-2.5 mr-0.5" />
                            {item.condition}
                          </Badge>
                        )}
                        {item.fuelType && item.fuelType !== 'N/A' && (
                          <Badge variant="outline" className="text-[10px] font-medium">
                            <Fuel className="w-2.5 h-2.5 mr-0.5" />
                            {item.fuelType}
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground mb-2">
                        {item.hp && (
                          <span className="flex items-center gap-0.5">
                            <Gauge className="w-3 h-3" />
                            {item.hp} HP
                          </span>
                        )}
                        {item.kw && (
                          <span>{item.kw} kW</span>
                        )}
                        {item.rpm && (
                          <span>{item.rpm} RPM</span>
                        )}
                        {item.hours && item.hours !== 'N/A' && item.hours !== '0' && (
                          <span className="flex items-center gap-0.5">
                            <Clock className="w-3 h-3" />
                            {Number(item.hours).toLocaleString()} hrs
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground mb-2">
                        {item.enclosure && item.enclosure !== 'N/A' && (
                          <span>{item.enclosure}</span>
                        )}
                        {item.volts && item.volts !== 'N/A' && (
                          <span>{item.volts}V</span>
                        )}
                        {item.tierRating && item.tierRating !== 'N/A' && (
                          <span>Tier {item.tierRating}</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t">
                        {item.price && !isNaN(Number(item.price)) ? (
                          <span className="font-bold text-accent flex items-center gap-1" data-testid={`text-price-${item.id}`}>
                            <DollarSign className="w-4 h-4" />
                            {Number(item.price).toLocaleString()}
                          </span>
                        ) : (
                          <span className="font-semibold text-accent text-sm" data-testid={`text-price-${item.id}`}>Call for Price</span>
                        )}
                        <Link href={`/quote/item/power-unit/${item.id}`}>
                          <Button size="sm" variant="outline" className="gap-1 text-xs" data-testid={`button-quote-${item.id}`}>
                            Get Quote
                            <ArrowRight className="w-3 h-3" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-8">
                  <Button
                    variant="outline"
                    disabled={page <= 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    data-testid="button-prev-page"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    disabled={page >= totalPages}
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    data-testid="button-next-page"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
