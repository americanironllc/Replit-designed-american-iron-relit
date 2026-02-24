import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Gauge,
  Tag,
  Truck,
  FileText,
  ChevronRight,
} from "lucide-react";
import type { Equipment } from "@shared/schema";
import { useFlashReveal } from "@/hooks/useFlashReveal";
import { getCategoryImage } from "@/lib/equipmentImages";

export default function EquipmentDetails() {
  const { id } = useParams<{ id: string }>();
  const contentRef = useFlashReveal();

  const { data: item, isLoading } = useQuery<Equipment>({
    queryKey: [`/api/equipment/${id}`],
  });

  if (isLoading) {
    return (
      <div className="flash-page-transition max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <Skeleton className="h-6 w-40 mb-8" />
        <div className="grid lg:grid-cols-2 gap-8">
          <Skeleton className="aspect-[4/3] rounded-md" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center flash-page-transition">
        <h2 className="text-2xl font-bold mb-4">Equipment Not Found</h2>
        <p className="text-muted-foreground mb-6">The equipment listing you're looking for doesn't exist.</p>
        <Link href="/equipment/listings">
          <Button data-testid="button-back-to-inventory">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Inventory
          </Button>
        </Link>
      </div>
    );
  }

  const specs = [
    { icon: Tag, label: "Make", value: item.make },
    { icon: Tag, label: "Model", value: item.model },
    { icon: Calendar, label: "Year", value: item.year?.toString() || "N/A" },
    { icon: Gauge, label: "Meter", value: item.meter ? `${item.meter.toLocaleString()} hrs` : "N/A" },
    { icon: MapPin, label: "Location", value: [item.city, item.state].filter(Boolean).join(", ") || "N/A" },
  ];

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
              <span className="cursor-pointer">Categories</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-foreground font-medium">
              {item.make} {item.model}
            </span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10" ref={contentRef}>
        <div className="grid lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3">
            <div className="flash-reveal-scale aspect-[4/3] rounded-md overflow-hidden bg-muted">
              <img
                src={item.imageUrl || getCategoryImage(item.category)}
                alt={`${item.make} ${item.model}`}
                className="w-full h-full object-cover"
                data-testid="img-equipment"
              />
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="flash-reveal">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-primary/10 text-primary no-default-active-elevate">
                  {item.category}
                </Badge>
                <span className="text-sm text-muted-foreground">ID: {item.equipmentId}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight" data-testid="text-equipment-title">
                {item.make} {item.model}
              </h1>
            </div>

            <div className="flash-reveal text-3xl font-bold text-accent" style={{ "--flash-index": 1 } as any} data-testid="text-equipment-price">
              {item.price && item.price !== "CALL" ? item.price : "Call for Price"}
            </div>

            <Card className="flash-reveal-scale p-0 border-card-border divide-y" style={{ "--flash-index": 2 } as any}>
              {specs.map((spec) => (
                <div key={spec.label} className="flex items-center justify-between px-5 py-3.5">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <spec.icon className="w-4 h-4" />
                    {spec.label}
                  </div>
                  <span className="font-medium text-sm">{spec.value}</span>
                </div>
              ))}
            </Card>

            <div className="flash-reveal flex flex-col gap-3" style={{ "--flash-index": 3 } as any}>
              <Link href={`/quote/item/equipment/${id}`}>
                <Button className="w-full bg-accent text-accent-foreground gap-2" size="lg" data-testid="button-get-quote-detail">
                  <FileText className="w-4 h-4" />
                  Get a Quote
                </Button>
              </Link>
              <Link href="/services/shipping">
                <Button className="w-full gap-2" variant="outline" size="lg" data-testid="button-shipping-detail">
                  <Truck className="w-4 h-4" />
                  Shipping & Forwarding
                </Button>
              </Link>
            </div>

            <p className="flash-reveal text-xs text-muted-foreground leading-relaxed" style={{ "--flash-index": 4 } as any}>
              Availability and pricing subject to change. Contact American Iron LLC for confirmation and formal quote.
            </p>
          </div>
        </div>

        <div className="flash-reveal mt-8" style={{ "--flash-index": 5 } as any}>
          <Link href="/equipment/listings">
            <Button variant="outline" className="gap-2" data-testid="button-back-inventory">
              <ArrowLeft className="w-4 h-4" />
              Back to Inventory
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
