import { useState, useEffect } from "react";
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
import { Search, ArrowRight, MapPin, Calendar, Gauge, ChevronRight, ChevronLeft } from "lucide-react";
import type { Equipment } from "@shared/schema";
import { useFlashReveal } from "@/hooks/useFlashReveal";

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

const CATEGORY_IMAGES: Record<string, string> = {
  "EXCAVATORS": excavatorsImg,
  "BULLDOZERS": bulldozersImg,
  "WHEEL LOADERS": wheelLoadersImg,
  "ARTICULATED TRUCKS": articulatedTruckImg,
  "MOTOR GRADERS": motorGradersImg,
  "SCRAPERS": scrapersImg,
  "TELEHANDLERS": telehandlerImg,
  "TRACK DOZERS": trackDozerImg,
  "SKIDSTEER": skidsteerImg,
  "BACKHOES": backhoeImg,
  "OFF-HIGHWAY TRUCKS": offHighwayTrucksImg,
  "COMPACTORS": compactorsImg,
  "COLD PLANERS": coldPlanerImg,
  "ASPHALT PAVERS": asphaltPaversImg,
  "FORESTRY EQUIPMENT": forestryImg,
};

const CATEGORIES = [
  "ALL",
  "EXCAVATORS",
  "BULLDOZERS",
  "WHEEL LOADERS",
  "ARTICULATED TRUCKS",
  "MOTOR GRADERS",
  "SCRAPERS",
  "TELEHANDLERS",
  "TRACK DOZERS",
  "SKIDSTEER",
  "BACKHOES",
  "OFF-HIGHWAY TRUCKS",
  "COMPACTORS",
  "COLD PLANERS",
  "ASPHALT PAVERS",
  "FORESTRY EQUIPMENT",
  "PIPELAYERS",
  "OTHER EQUIPMENT",
];

const ITEMS_PER_PAGE = 24;

export default function EquipmentInventory() {
  const [location] = useLocation();
  const searchStr = typeof window !== "undefined" ? window.location.search : "";
  const params = new URLSearchParams(searchStr);
  const initialCategory = params.get("category") || "ALL";

  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState(initialCategory);
  const [page, setPage] = useState(1);

  const heroRef = useFlashReveal();
  const gridRef = useFlashReveal();

  useEffect(() => {
    setPage(1);
  }, [category, searchTerm]);

  const queryUrl = (() => {
    const p = new URLSearchParams();
    if (category !== "ALL") p.set("category", category);
    if (searchTerm) p.set("search", searchTerm);
    p.set("page", String(page));
    p.set("limit", String(ITEMS_PER_PAGE));
    return `/api/equipment?${p.toString()}`;
  })();

  const { data, isLoading } = useQuery<{ items: Equipment[]; total: number }>({
    queryKey: [queryUrl],
  });

  const equipment = data?.items;
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  return (
    <div className="flash-page-transition">
      <div className="bg-card border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground" data-testid="breadcrumb">
            <Link href="/">
              <span className="cursor-pointer">Home</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/equipment">
              <span className="cursor-pointer">Equipment</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-foreground font-medium">
              {category !== "ALL" ? category : "All Listings"}
            </span>
          </nav>
        </div>
      </div>

      <section className="relative py-16 overflow-hidden" ref={heroRef}>
        <div className="absolute inset-0 bg-primary" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
          <h1 className="flash-reveal text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-foreground mb-4 tracking-tight" data-testid="text-page-title">
            {category !== "ALL" ? category : "Equipment Inventory"}
          </h1>
          <p className="flash-reveal text-primary-foreground/70 text-lg max-w-2xl" style={{ "--flash-index": 1 } as any}>
            {category !== "ALL"
              ? `Browse our ${category.toLowerCase()} inventory. Filter and search across available listings.`
              : "Filter by category and search by make, model, ID, or location across our comprehensive inventory."}
          </p>
        </div>
      </section>

      <section className="py-8 border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by make, model, ID, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search"
              />
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full sm:w-[220px]" data-testid="select-category">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat === "ALL" ? "All Categories" : cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {data && (
            <div className="mt-4 text-sm text-muted-foreground" data-testid="text-result-count">
              Showing <span className="font-semibold text-foreground">{((page - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(page * ITEMS_PER_PAGE, total)}</span> of <span className="font-semibold text-foreground">{total.toLocaleString()}</span> results
            </div>
          )}
        </div>
      </section>

      <section className="py-8" ref={gridRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="border-card-border">
                  <Skeleton className="aspect-[4/3] rounded-t-md" />
                  <div className="p-4 space-y-3">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </Card>
              ))}
            </div>
          ) : equipment && equipment.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 flash-stagger">
                {equipment.map((item, i) => (
                  <Link key={item.id} href={`/equipment/details/${item.equipmentId}`}>
                    <Card
                      className="flash-reveal-scale group overflow-visible hover-elevate cursor-pointer border-card-border h-full"
                      style={{ "--flash-index": i % 8 } as any}
                      data-testid={`card-equipment-${item.equipmentId}`}
                    >
                      <div className="aspect-[4/3] relative rounded-t-md overflow-hidden bg-muted">
                        <img
                          src={item.imageUrl || CATEGORY_IMAGES[item.category] || bulldozersImg}
                          alt={`${item.make} ${item.model}`}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute top-3 left-3">
                          <span className="text-xs font-medium bg-primary/90 text-primary-foreground px-2.5 py-1 rounded-md">
                            {item.category}
                          </span>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-base mb-1">
                          {item.make} {item.model}
                        </h3>
                        <div className="text-xs text-muted-foreground mb-3">
                          ID: {item.equipmentId}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {item.year && (
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>{item.year}</span>
                            </div>
                          )}
                          {item.meter && (
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Gauge className="w-3.5 h-3.5" />
                              <span>{item.meter.toLocaleString()} hrs</span>
                            </div>
                          )}
                          {(item.city || item.state) && (
                            <div className="flex items-center gap-1.5 text-muted-foreground col-span-2">
                              <MapPin className="w-3.5 h-3.5" />
                              <span>{[item.city, item.state].filter(Boolean).join(", ")}</span>
                            </div>
                          )}
                        </div>
                        <div className="mt-3 pt-3 border-t flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1 font-bold text-accent text-lg">
                            {item.price && item.price !== "CALL" ? (
                              <>{item.price}</>
                            ) : (
                              <span className="text-sm font-medium text-muted-foreground">Call for Price</span>
                            )}
                          </div>
                          <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8" data-testid="pagination">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    data-testid="button-prev-page"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {(() => {
                      const pages: number[] = [];
                      const start = Math.max(1, page - 2);
                      const end = Math.min(totalPages, page + 2);
                      if (start > 1) pages.push(1);
                      if (start > 2) pages.push(-1);
                      for (let i = start; i <= end; i++) pages.push(i);
                      if (end < totalPages - 1) pages.push(-2);
                      if (end < totalPages) pages.push(totalPages);
                      return pages.map((p, idx) =>
                        p < 0 ? (
                          <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground">...</span>
                        ) : (
                          <Button
                            key={p}
                            variant={p === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => setPage(p)}
                            className="min-w-[36px]"
                            data-testid={`button-page-${p}`}
                          >
                            {p}
                          </Button>
                        )
                      );
                    })()}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    data-testid="button-next-page"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-7 h-7 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">No equipment found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
