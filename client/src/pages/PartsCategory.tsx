import { useState, useEffect, useMemo } from "react";
import { useParams, Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  ShoppingCart,
  Plus,
  Check,
  X,
  Filter,
  Wrench,
  Cog,
} from "lucide-react";
import type { Part } from "@shared/schema";
import { useFlashReveal } from "@/hooks/useFlashReveal";
import { useQuoteCart } from "@/hooks/useQuoteCart";

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

interface PartsResponse {
  items: Part[];
  total: number;
}

export default function PartsCategory() {
  const { category: rawCategory } = useParams<{ category: string }>();
  const category = rawCategory ? decodeURIComponent(rawCategory) : "all";
  const [location] = useLocation();

  const urlSearch = useMemo(() => {
    const idx = location.indexOf("?");
    if (idx === -1) return "";
    return new URLSearchParams(location.slice(idx)).get("search") || "";
  }, [location]);

  const [searchTerm, setSearchTerm] = useState(urlSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(urlSearch);
  const [page, setPage] = useState(1);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const limit = 48;

  const { items: cartItems, addItem, removeItem, isInCart } = useQuoteCart();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    setPage(1);
    setSelectedSubcategory(null);
  }, [category]);

  const queryUrl = useMemo(() => {
    const p = new URLSearchParams();
    if (category && category !== "all") p.set("category", category);
    if (selectedSubcategory) p.set("subcategory", selectedSubcategory);
    if (debouncedSearch) p.set("search", debouncedSearch);
    p.set("page", String(page));
    p.set("limit", String(limit));
    return `/api/parts?${p.toString()}`;
  }, [category, selectedSubcategory, debouncedSearch, page, limit]);

  const { data, isLoading } = useQuery<PartsResponse>({
    queryKey: ["/api/parts", category, selectedSubcategory, debouncedSearch, page],
    queryFn: async () => {
      const res = await fetch(queryUrl);
      if (!res.ok) throw new Error("Failed to fetch parts");
      return res.json();
    },
  });

  const { data: subcategoryCounts } = useQuery<Record<string, number>>({
    queryKey: ["/api/parts/subcategories/counts", category],
    queryFn: async () => {
      const p = new URLSearchParams();
      if (category && category !== "all") p.set("category", category);
      const res = await fetch(`/api/parts/subcategories/counts?${p.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch subcategory counts");
      return res.json();
    },
  });

  const sortedSubcategories = useMemo(() => {
    if (!subcategoryCounts) return [];
    return Object.entries(subcategoryCounts)
      .sort((a, b) => b[1] - a[1])
      .filter(([name]) => name !== "Other" && name.length > 1);
  }, [subcategoryCounts]);

  const parts = data?.items || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  const label = category === "all" ? "All Parts" : category;
  const categoryImage = CATEGORY_IMAGES[category] || "/images/parts/generic-part.png";

  const heroRef = useFlashReveal();

  return (
    <div className="flash-page-transition">
      <div className="bg-card border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground" data-testid="breadcrumb-parts">
            <Link href="/">
              <span className="cursor-pointer hover:text-foreground transition-colors">Home</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/parts">
              <span className="cursor-pointer hover:text-foreground transition-colors">Parts</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-foreground font-medium">{label}</span>
          </nav>
        </div>
      </div>

      <section className="relative py-12 overflow-hidden bg-black" ref={heroRef}>
        <img
          src={categoryImage}
          alt={label}
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Link href="/parts">
                  <Button variant="ghost" size="sm" className="gap-1 -ml-2 text-white/60 hover:text-white hover:bg-white/10" data-testid="button-back-to-catalog">
                    <ArrowLeft className="w-4 h-4" />
                    Catalog
                  </Button>
                </Link>
              </div>
              <h1 className="flash-reveal text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white" data-testid="text-parts-category-title">
                {label}
              </h1>
              <div className="flash-reveal mt-2 flex items-center gap-3 text-sm" style={{ "--flash-index": 1 } as any}>
                <span className="text-white/70">
                  <span className="font-semibold text-accent" data-testid="text-parts-count">{total.toLocaleString()}</span> parts available
                </span>
                {selectedSubcategory && (
                  <Badge variant="secondary" className="text-xs no-default-active-elevate bg-white/20 text-white border-0">
                    {selectedSubcategory}
                    <button onClick={() => setSelectedSubcategory(null)} className="ml-1 hover:text-accent">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {cartItems.length > 0 && (
                <Link href="/quote">
                  <Button className="bg-accent text-accent-foreground gap-2" data-testid="button-view-quote">
                    <ShoppingCart className="w-4 h-4" />
                    Quote ({cartItems.length})
                  </Button>
                </Link>
              )}
              <Link href="/quote">
                <Button variant="outline" className="gap-2 text-white border-white/30 bg-white/10" data-testid="button-quote-from-parts">
                  Request Quote
                </Button>
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
              <Input
                placeholder="Search by part number, description, or equipment..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/40"
                data-testid="input-search-parts"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              className="lg:hidden gap-2 text-white border-white/30 bg-white/10"
              onClick={() => setShowMobileSidebar(!showMobileSidebar)}
              data-testid="button-toggle-filters"
            >
              <Filter className="w-4 h-4" />
              Filters
            </Button>
          </div>
        </div>
      </section>

      <section className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex gap-6">
            {sortedSubcategories.length > 0 && (
              <aside className={`${showMobileSidebar ? "fixed inset-0 z-50 bg-background p-6 overflow-y-auto" : "hidden"} lg:block lg:static lg:w-56 lg:shrink-0`}>
                {showMobileSidebar && (
                  <div className="flex items-center justify-between mb-4 lg:hidden">
                    <h3 className="font-semibold text-lg">Subcategories</h3>
                    <Button variant="ghost" size="sm" onClick={() => setShowMobileSidebar(false)}>
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                )}
                <div className="hidden lg:block">
                  <h3 className="font-semibold text-xs mb-3 text-muted-foreground uppercase tracking-wider">Subcategories</h3>
                </div>
                <div className="space-y-0.5 max-h-[70vh] overflow-y-auto">
                  <button
                    onClick={() => { setSelectedSubcategory(null); setPage(1); setShowMobileSidebar(false); }}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      !selectedSubcategory ? "bg-accent/10 text-accent font-medium" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                    data-testid="button-subcategory-all"
                  >
                    All
                  </button>
                  {sortedSubcategories.map(([name, count]) => (
                    <button
                      key={name}
                      onClick={() => { setSelectedSubcategory(name); setPage(1); setShowMobileSidebar(false); }}
                      className={`w-full text-left px-3 py-1.5 rounded-md text-xs transition-colors flex items-center justify-between ${
                        selectedSubcategory === name ? "bg-accent/10 text-accent font-medium" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                      data-testid={`button-subcategory-${name.toLowerCase().replace(/\s+/g, "-")}`}
                    >
                      <span className="truncate mr-2">{name}</span>
                      <span className="text-[10px] opacity-50 shrink-0">{count}</span>
                    </button>
                  ))}
                </div>
              </aside>
            )}

            <div className="flex-1 min-w-0">
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <Skeleton key={i} className="h-64 w-full rounded-lg" />
                  ))}
                </div>
              ) : parts.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {parts.map((part) => {
                      const inCart = isInCart(part.partNumber);
                      const partImage = part.imageUrl || CATEGORY_IMAGES[part.category] || "/images/parts/generic-part.png";
                      return (
                        <Card
                          key={part.id}
                          className="group overflow-hidden border-card-border hover-elevate transition-all duration-300"
                          data-testid={`card-part-${part.id}`}
                        >
                          <div className="aspect-[4/3] relative overflow-hidden bg-black">
                            <img
                              src={partImage}
                              alt={part.description}
                              className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-all duration-500 group-hover:scale-105"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                            <div className="absolute top-2 left-2">
                              <span className="bg-accent text-black text-[10px] font-bold px-2 py-0.5 rounded font-mono">
                                {part.partNumber}
                              </span>
                            </div>
                            <button
                              onClick={(e) => { e.stopPropagation(); e.preventDefault(); inCart ? removeItem(part.partNumber) : addItem(part); }}
                              className={`absolute top-2 right-2 w-8 h-8 rounded-lg flex items-center justify-center transition-all shadow-md ${
                                inCart
                                  ? "bg-accent text-black hover:bg-red-500 hover:text-white"
                                  : "bg-black/60 text-white hover:bg-accent hover:text-black backdrop-blur-sm"
                              }`}
                              title={inCart ? "Remove from quote" : "Add to quote"}
                              data-testid={`button-addtoquote-${part.partNumber}`}
                            >
                              {inCart ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                            </button>
                            <div className="absolute bottom-2 left-2 right-2">
                              <h3 className="text-white font-semibold text-sm leading-tight line-clamp-2">
                                {part.description}
                              </h3>
                            </div>
                          </div>
                          <div className="p-3 space-y-2">
                            {part.subcategory && (
                              <Badge variant="outline" className="text-[10px] no-default-active-elevate">
                                {part.subcategory}
                              </Badge>
                            )}
                            {part.equipment && (
                              <div className="flex items-start gap-1.5">
                                <Wrench className="w-3 h-3 text-muted-foreground mt-0.5 shrink-0" />
                                <p className="text-[11px] text-muted-foreground leading-tight line-clamp-2">
                                  {part.equipment}
                                </p>
                              </div>
                            )}
                            {part.engineModel && (
                              <div className="flex items-start gap-1.5">
                                <Cog className="w-3 h-3 text-muted-foreground mt-0.5 shrink-0" />
                                <p className="text-[11px] text-muted-foreground leading-tight line-clamp-1">
                                  Engine: {part.engineModel}
                                </p>
                              </div>
                            )}
                            <div className="flex items-center justify-between pt-1 border-t border-border/50">
                              <span className="text-sm font-bold text-accent">
                                {part.price || "Call for Price"}
                              </span>
                              <button
                                onClick={(e) => { e.stopPropagation(); e.preventDefault(); inCart ? removeItem(part.partNumber) : addItem(part); }}
                                className={`text-xs font-medium flex items-center gap-1 px-2 py-1 rounded transition-colors ${
                                  inCart
                                    ? "text-accent hover:text-red-500"
                                    : "text-muted-foreground hover:text-accent"
                                }`}
                                data-testid={`button-addquote-bottom-${part.partNumber}`}
                              >
                                {inCart ? (
                                  <><Check className="w-3 h-3" /> In Quote</>
                                ) : (
                                  <><Plus className="w-3 h-3" /> Add to Quote</>
                                )}
                              </button>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>

                  {totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between mt-8 gap-4">
                      <p className="text-sm text-muted-foreground">
                        Showing {((page - 1) * limit) + 1}–{Math.min(page * limit, total)} of {total.toLocaleString()} parts
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => { setPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                          disabled={page <= 1}
                          data-testid="button-prev-page"
                        >
                          <ChevronLeft className="w-4 h-4 mr-1" />
                          Prev
                        </Button>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                            let pageNum: number;
                            if (totalPages <= 7) {
                              pageNum = i + 1;
                            } else if (page <= 4) {
                              pageNum = i + 1;
                            } else if (page >= totalPages - 3) {
                              pageNum = totalPages - 6 + i;
                            } else {
                              pageNum = page - 3 + i;
                            }
                            return (
                              <Button
                                key={pageNum}
                                variant={pageNum === page ? "default" : "ghost"}
                                size="sm"
                                className={`w-8 h-8 p-0 ${pageNum === page ? "bg-accent text-accent-foreground" : ""}`}
                                onClick={() => { setPage(pageNum); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                data-testid={`button-page-${pageNum}`}
                              >
                                {pageNum}
                              </Button>
                            );
                          })}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => { setPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                          disabled={page >= totalPages}
                          data-testid="button-next-page"
                        >
                          Next
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-20">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-7 h-7 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">No parts found</h3>
                  <p className="text-muted-foreground mb-4">Try adjusting your search or filters.</p>
                  <div className="flex gap-3 justify-center">
                    {selectedSubcategory && (
                      <Button variant="outline" className="gap-2" onClick={() => setSelectedSubcategory(null)} data-testid="button-clear-subcategory">
                        Clear Subcategory
                      </Button>
                    )}
                    <Link href="/parts">
                      <Button variant="outline" className="gap-2" data-testid="button-back-to-catalog-empty">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Catalog
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {cartItems.length > 0 && (
        <div className="fixed bottom-4 right-4 z-40">
          <Link href="/quote">
            <Button
              size="lg"
              className="bg-accent text-accent-foreground gap-2 shadow-lg rounded-full px-6"
              data-testid="button-floating-quote"
            >
              <ShoppingCart className="w-5 h-5" />
              Quote ({cartItems.length} items)
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
