import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Ship, FileText, Package, CalendarClock, ArrowRight, Globe, Truck, Plane, Anchor, Loader2, ExternalLink, DollarSign, Clock, Weight } from "lucide-react";
import { useFlashReveal } from "@/hooks/useFlashReveal";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

const services = [
  { icon: Ship, title: "Ocean & Air Freight Coordination", desc: "Full-service international freight management for ocean and air cargo shipments." },
  { icon: FileText, title: "Export Documentation Support", desc: "Comprehensive customs documentation preparation and compliance management." },
  { icon: Package, title: "Packaging / Crating Planning", desc: "Professional packaging and crating solutions for safe international transit." },
  { icon: CalendarClock, title: "Pickup & Delivery Scheduling", desc: "Door-to-port and port-to-door scheduling for seamless logistics chain." },
];

interface UPSRate {
  serviceCode: string;
  serviceName: string;
  totalCharges: string;
  currency: string;
  guaranteedDays: string | null;
  deliveryByTime: string | null;
  billingWeight: string | null;
  billingWeightUnit: string;
}

const COUNTRIES = [
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "MX", name: "Mexico" },
  { code: "GB", name: "United Kingdom" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "ES", name: "Spain" },
  { code: "IT", name: "Italy" },
  { code: "NL", name: "Netherlands" },
  { code: "BE", name: "Belgium" },
  { code: "AU", name: "Australia" },
  { code: "JP", name: "Japan" },
  { code: "CN", name: "China" },
  { code: "KR", name: "South Korea" },
  { code: "SG", name: "Singapore" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "BR", name: "Brazil" },
  { code: "CO", name: "Colombia" },
  { code: "CL", name: "Chile" },
  { code: "PE", name: "Peru" },
  { code: "AR", name: "Argentina" },
  { code: "IN", name: "India" },
  { code: "PH", name: "Philippines" },
  { code: "TH", name: "Thailand" },
  { code: "VN", name: "Vietnam" },
  { code: "ZA", name: "South Africa" },
  { code: "NG", name: "Nigeria" },
  { code: "EG", name: "Egypt" },
  { code: "TR", name: "Turkey" },
];

function UPSRateCalculator() {
  const [originCity, setOriginCity] = useState("Tampa");
  const [originState, setOriginState] = useState("FL");
  const [originPostal, setOriginPostal] = useState("33601");
  const [originCountry, setOriginCountry] = useState("US");
  const [destCity, setDestCity] = useState("");
  const [destState, setDestState] = useState("");
  const [destPostal, setDestPostal] = useState("");
  const [destCountry, setDestCountry] = useState("US");
  const [weightLbs, setWeightLbs] = useState("");
  const [lengthIn, setLengthIn] = useState("");
  const [widthIn, setWidthIn] = useState("");
  const [heightIn, setHeightIn] = useState("");

  const rateMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/shipping/ups-rates", {
        originCity,
        originState,
        originPostal,
        originCountry,
        destCity,
        destState: destState || undefined,
        destPostal,
        destCountry,
        weightLbs: parseFloat(weightLbs),
        lengthIn: parseFloat(lengthIn),
        widthIn: parseFloat(widthIn),
        heightIn: parseFloat(heightIn),
      });
      return res.json();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    rateMutation.mutate();
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-semibold text-sm uppercase tracking-wider text-accent flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent" />
              Origin (Ship From)
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="origin-city" className="text-xs text-muted-foreground">City</Label>
                <Input id="origin-city" value={originCity} onChange={(e) => setOriginCity(e.target.value)} placeholder="Tampa" data-testid="input-origin-city" />
              </div>
              <div>
                <Label htmlFor="origin-state" className="text-xs text-muted-foreground">State / Province</Label>
                <Input id="origin-state" value={originState} onChange={(e) => setOriginState(e.target.value)} placeholder="FL" data-testid="input-origin-state" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="origin-postal" className="text-xs text-muted-foreground">Postal Code</Label>
                <Input id="origin-postal" value={originPostal} onChange={(e) => setOriginPostal(e.target.value)} placeholder="33601" data-testid="input-origin-postal" />
              </div>
              <div>
                <Label htmlFor="origin-country" className="text-xs text-muted-foreground">Country</Label>
                <Select value={originCountry} onValueChange={setOriginCountry}>
                  <SelectTrigger data-testid="select-origin-country">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map(c => (
                      <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-sm uppercase tracking-wider text-accent flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent" />
              Destination (Ship To)
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="dest-city" className="text-xs text-muted-foreground">City</Label>
                <Input id="dest-city" value={destCity} onChange={(e) => setDestCity(e.target.value)} placeholder="New York" data-testid="input-dest-city" />
              </div>
              <div>
                <Label htmlFor="dest-state" className="text-xs text-muted-foreground">State / Province</Label>
                <Input id="dest-state" value={destState} onChange={(e) => setDestState(e.target.value)} placeholder="NY" data-testid="input-dest-state" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="dest-postal" className="text-xs text-muted-foreground">Postal Code</Label>
                <Input id="dest-postal" value={destPostal} onChange={(e) => setDestPostal(e.target.value)} placeholder="10001" data-testid="input-dest-postal" />
              </div>
              <div>
                <Label htmlFor="dest-country" className="text-xs text-muted-foreground">Country</Label>
                <Select value={destCountry} onValueChange={setDestCountry}>
                  <SelectTrigger data-testid="select-dest-country">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map(c => (
                      <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-sm uppercase tracking-wider text-accent flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-accent" />
            Package Details
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <Label htmlFor="weight" className="text-xs text-muted-foreground">Weight (lbs)</Label>
              <Input id="weight" type="number" value={weightLbs} onChange={(e) => setWeightLbs(e.target.value)} placeholder="50" min="0.1" max="150" step="0.1" data-testid="input-weight" />
            </div>
            <div>
              <Label htmlFor="length" className="text-xs text-muted-foreground">Length (in)</Label>
              <Input id="length" type="number" value={lengthIn} onChange={(e) => setLengthIn(e.target.value)} placeholder="24" min="1" max="108" data-testid="input-length" />
            </div>
            <div>
              <Label htmlFor="width" className="text-xs text-muted-foreground">Width (in)</Label>
              <Input id="width" type="number" value={widthIn} onChange={(e) => setWidthIn(e.target.value)} placeholder="18" min="1" max="108" data-testid="input-width" />
            </div>
            <div>
              <Label htmlFor="height" className="text-xs text-muted-foreground">Height (in)</Label>
              <Input id="height" type="number" value={heightIn} onChange={(e) => setHeightIn(e.target.value)} placeholder="12" min="1" max="108" data-testid="input-height" />
            </div>
          </div>
        </div>

        <Button
          type="submit"
          className="bg-accent text-accent-foreground gap-2 w-full sm:w-auto"
          disabled={rateMutation.isPending || !destCity || !destPostal || !weightLbs || !lengthIn || !widthIn || !heightIn}
          data-testid="button-get-ups-rates"
        >
          {rateMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Getting Rates...
            </>
          ) : (
            <>
              <Truck className="w-4 h-4" />
              Get UPS Rates
            </>
          )}
        </Button>
      </form>

      {rateMutation.isError && (
        <div className="mt-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20" data-testid="text-ups-error">
          <p className="text-red-500 text-sm font-medium">Unable to retrieve rates. Please verify the addresses and package details and try again.</p>
        </div>
      )}

      {rateMutation.isSuccess && rateMutation.data?.rates && (
        <div className="mt-6 space-y-4" data-testid="ups-results">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-lg">Available UPS Services</h4>
            <p className="text-xs text-muted-foreground">
              {rateMutation.data.origin} → {rateMutation.data.destination}
            </p>
          </div>
          {rateMutation.data.rates.length === 0 ? (
            <p className="text-muted-foreground">No rates available for this route.</p>
          ) : (
            <div className="grid gap-3">
              {(rateMutation.data.rates as UPSRate[]).map((rate) => (
                <div
                  key={rate.serviceCode}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border border-card-border bg-card hover:border-accent/50 transition-colors"
                  data-testid={`ups-rate-${rate.serviceCode}`}
                >
                  <div className="flex items-center gap-3 mb-2 sm:mb-0">
                    <div className="w-10 h-10 rounded-md bg-[#351C15] flex items-center justify-center shrink-0">
                      <Truck className="w-5 h-5 text-[#FFB500]" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{rate.serviceName}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                        {rate.guaranteedDays && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {rate.guaranteedDays} business day{rate.guaranteedDays !== "1" ? "s" : ""}
                          </span>
                        )}
                        {rate.deliveryByTime && (
                          <span>by {rate.deliveryByTime}</span>
                        )}
                        {rate.billingWeight && (
                          <span className="flex items-center gap-1">
                            <Weight className="w-3 h-3" />
                            {rate.billingWeight} {rate.billingWeightUnit}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-accent" />
                    <span className="text-xl font-bold">{parseFloat(rate.totalCharges).toFixed(2)}</span>
                    <span className="text-xs text-muted-foreground">{rate.currency}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Rates shown are estimates. Actual charges may vary based on accessorial services, fuel surcharges, and final package measurements. Contact us for a formal shipping quote.
          </p>
        </div>
      )}
    </div>
  );
}

function MaerskSection() {
  return (
    <div className="space-y-6">
      <p className="text-muted-foreground leading-relaxed">
        American Iron LLC partners with Maersk, the world's largest container shipping line, for ocean and air freight services. Get instant quotes through Maersk's online tools for full container load (FCL), less-than-container load (LCL), and air cargo shipments.
      </p>

      <div className="grid sm:grid-cols-2 gap-4">
        <Card className="p-6 border-card-border hover:border-accent/50 transition-colors">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-md bg-[#004B93]/10 flex items-center justify-center shrink-0">
              <Anchor className="w-6 h-6 text-[#004B93]" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-lg mb-1">Ocean Freight</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Get instant spot rates for FCL & LCL ocean freight shipments worldwide. Container types include 20ft, 40ft, 40ft HC, and more.
              </p>
              <ul className="text-xs text-muted-foreground space-y-1 mb-4">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  Full Container Load (FCL) rates
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  Less-than-Container Load (LCL) rates
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  Door-to-door or port-to-port options
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  Guaranteed space & equipment availability
                </li>
              </ul>
              <a
                href="https://www.maersk.com/onlinequote/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="bg-[#004B93] text-white gap-2 w-full" data-testid="button-maersk-ocean">
                  <Anchor className="w-4 h-4" />
                  Get Ocean Quote
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </a>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-card-border hover:border-accent/50 transition-colors">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-md bg-[#004B93]/10 flex items-center justify-center shrink-0">
              <Plane className="w-6 h-6 text-[#004B93]" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-lg mb-1">Air Freight</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Maersk Air Freight offers Priority, Premium, and Economy services through their global airline partner network.
              </p>
              <ul className="text-xs text-muted-foreground space-y-1 mb-4">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  Priority Air — Under 3 days delivery
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  Premium Air — 3 to 5 days delivery
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  Economy Air — 5 to 7 days delivery
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  Dangerous goods & temperature-controlled
                </li>
              </ul>
              <a
                href="https://www.maersk.com/transportation-services/air-freight"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="bg-[#004B93] text-white gap-2 w-full" data-testid="button-maersk-air">
                  <Plane className="w-4 h-4" />
                  Get Air Freight Quote
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </a>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-5 border-accent/20 bg-accent/5">
        <div className="flex items-start gap-3">
          <Globe className="w-5 h-5 text-accent shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium mb-1">Need help with your Maersk booking?</p>
            <p className="text-xs text-muted-foreground">
              Our logistics team can assist with Maersk ocean and air freight bookings, customs documentation, and door-to-door coordination. Call us at <a href="tel:+18507773797" className="text-accent font-medium">+1 (850) 777-3797</a> or WhatsApp <a href="https://wa.me/18132006088" target="_blank" className="text-accent font-medium">+1 (813) 200-6088</a>.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default function ServiceShipping() {
  const heroRef = useFlashReveal();
  const cardsRef = useFlashReveal();
  const rateRef = useFlashReveal();
  const globalRef = useFlashReveal();

  return (
    <div className="flash-page-transition">
      <section className="relative py-24 overflow-hidden" ref={heroRef}>
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url(/images/service-shipping.png)" }} />
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/70 to-black/50" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl">
            <h1 className="flash-reveal text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight" data-testid="text-shipping-title">
              Global Shipping & Freight
            </h1>
            <p className="flash-reveal text-white/70 text-lg leading-relaxed" style={{ "--flash-index": 1 } as any}>
              Live shipping rates, ocean freight quotes, and expert freight forwarding. Secure, compliant global delivery from our Florida-based hub to any international port.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16" ref={cardsRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="flash-reveal text-2xl font-bold mb-8 tracking-tight">Freight Support</h2>
          <div className="grid sm:grid-cols-2 gap-4 flash-stagger">
            {services.map((svc, i) => (
              <Card key={svc.title} className="flash-reveal-scale p-6 border-card-border" style={{ "--flash-index": i } as any}>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-md bg-accent/10 flex items-center justify-center shrink-0">
                    <svc.icon className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{svc.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{svc.desc}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-card" ref={rateRef} id="rate-calculator">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flash-reveal mb-8">
            <h2 className="text-2xl font-bold tracking-tight mb-2" data-testid="text-rate-calculator-title">Shipping Rate Calculator</h2>
            <p className="text-muted-foreground">Get instant shipping quotes for your equipment and parts shipments worldwide.</p>
          </div>

          <Tabs defaultValue="ups" className="flash-reveal" style={{ "--flash-index": 1 } as any}>
            <TabsList className="mb-6 bg-muted/50">
              <TabsTrigger value="ups" className="gap-2 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground" data-testid="tab-ups">
                <Truck className="w-4 h-4" />
                UPS Rates
              </TabsTrigger>
              <TabsTrigger value="maersk" className="gap-2 data-[state=active]:bg-[#004B93] data-[state=active]:text-white" data-testid="tab-maersk">
                <Ship className="w-4 h-4" />
                Maersk Ocean & Air
              </TabsTrigger>
            </TabsList>

            <TabsContent value="ups">
              <Card className="p-6 border-card-border">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-md bg-[#351C15] flex items-center justify-center">
                    <Truck className="w-5 h-5 text-[#FFB500]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">UPS Live Rate Quotes</h3>
                    <p className="text-xs text-muted-foreground">Real-time shipping rates for ground and air services</p>
                  </div>
                </div>
                <UPSRateCalculator />
              </Card>
            </TabsContent>

            <TabsContent value="maersk">
              <Card className="p-6 border-card-border">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-md bg-[#004B93]/10 flex items-center justify-center">
                    <Ship className="w-5 h-5 text-[#004B93]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Maersk Ocean & Air Freight</h3>
                    <p className="text-xs text-muted-foreground">Global container shipping and air cargo through Maersk's network</p>
                  </div>
                </div>
                <MaerskSection />
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <section className="py-16" ref={globalRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flash-reveal flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-md bg-accent/10 flex items-center justify-center">
                  <Globe className="w-6 h-6 text-accent" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight">Global Shipping Network</h2>
              </div>
              <p className="flash-reveal text-muted-foreground leading-relaxed mb-6" style={{ "--flash-index": 1 } as any}>
                From our strategic headquarters in Tampa, Florida, we facilitate secure, compliant global delivery to any international port. Our team handles all customs documentation, freight coordination, and logistics planning.
              </p>
              <div className="flash-reveal flex flex-wrap gap-4" style={{ "--flash-index": 2 } as any}>
                <Link href="/contact">
                  <Button className="bg-accent text-accent-foreground gap-2" data-testid="button-contact-shipping">
                    Contact Us <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/quote">
                  <Button variant="outline" data-testid="button-request-quote-shipping">Request Quote</Button>
                </Link>
              </div>
            </div>
            <div className="flash-reveal-scale aspect-[4/3] rounded-md overflow-hidden" style={{ "--flash-index": 1 } as any}>
              <img src="/images/service-shipping.png" alt="International shipping" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
