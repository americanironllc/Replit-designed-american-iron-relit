import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import logoImg from "@assets/american_iron_new_logo_1771911523492.png";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Printer,
  Mail,
  CheckCircle2,
  Loader2,
  ChevronRight,
  Phone,
  MapPin,
  Globe,
  LogIn,
  Save,
  User,
} from "lucide-react";
import type { Equipment, PowerUnit } from "@shared/schema";
import { useFlashReveal } from "@/hooks/useFlashReveal";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";

function generateQuoteNumber() {
  const now = new Date();
  const y = now.getFullYear().toString().slice(-2);
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const r = Math.floor(1000 + Math.random() * 9000);
  return `AMI-${y}${m}${d}-${r}`;
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

interface QuoteItem {
  type: "equipment" | "power-unit";
  title: string;
  identifier: string;
  category: string;
  specs: { label: string; value: string }[];
  price: string;
  imageUrl: string | null;
  rawId: string | number;
}

function equipmentToQuoteItem(item: Equipment): QuoteItem {
  return {
    type: "equipment",
    title: `${item.make} ${item.model}`,
    identifier: item.equipmentId,
    category: item.category,
    specs: [
      { label: "Make", value: item.make },
      { label: "Model", value: item.model },
      { label: "Year", value: item.year?.toString() || "N/A" },
      { label: "Hours", value: item.meter ? `${item.meter.toLocaleString()} hrs` : "N/A" },
      { label: "Location", value: [item.city, item.state].filter(Boolean).join(", ") || "Tampa, FL" },
    ],
    price: item.price && item.price !== "CALL" ? item.price : "Call for Price",
    imageUrl: item.imageUrl,
    rawId: item.equipmentId,
  };
}

function powerUnitToQuoteItem(item: PowerUnit): QuoteItem {
  return {
    type: "power-unit",
    title: item.model,
    identifier: `SN: ${item.stockNumber}`,
    category: item.category,
    specs: [
      { label: "Model", value: item.model },
      { label: "Stock Number", value: item.stockNumber },
      { label: "Category", value: item.category },
      ...(item.hp ? [{ label: "Horsepower", value: `${item.hp} HP` }] : []),
      ...(item.kw ? [{ label: "Kilowatts", value: `${item.kw} kW` }] : []),
      ...(item.rpm ? [{ label: "RPM", value: `${item.rpm}` }] : []),
      ...(item.year ? [{ label: "Year", value: item.year }] : []),
      ...(item.condition ? [{ label: "Condition", value: item.condition }] : []),
      ...(item.location ? [{ label: "Location", value: item.location }] : []),
    ],
    price: item.price && !isNaN(Number(item.price)) ? `$${Number(item.price).toLocaleString()}` : "Call for Price",
    imageUrl: item.imageUrl,
    rawId: item.id,
  };
}

export default function QuotePreview() {
  const { type, id } = useParams<{ type: string; id: string }>();
  const [quoteNumber] = useState(generateQuoteNumber);
  const [quoteDate] = useState(() => new Date());
  const [emailOpen, setEmailOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [quoteSaved, setQuoteSaved] = useState(false);
  const { toast } = useToast();
  const contentRef = useFlashReveal();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const isEquipment = type === "equipment";
  const apiUrl = isEquipment ? `/api/equipment/${id}` : `/api/power-units/${id}`;

  const { data: rawItem, isLoading } = useQuery<Equipment | PowerUnit>({
    queryKey: [apiUrl],
  });

  const quoteItem: QuoteItem | null = rawItem
    ? isEquipment
      ? equipmentToQuoteItem(rawItem as Equipment)
      : powerUnitToQuoteItem(rawItem as PowerUnit)
    : null;

  useEffect(() => {
    if (isAuthenticated && user?.email && !email) {
      setEmail(user.email);
    }
  }, [isAuthenticated, user, email]);

  const saveQuoteMutation = useMutation({
    mutationFn: async () => {
      if (!quoteItem) return;
      const itemDesc = `${quoteItem.title} (${quoteItem.identifier}) - ${quoteItem.price}`;
      return apiRequest("POST", "/api/quotes", {
        name: [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Customer",
        email: user?.email || "",
        items: itemDesc,
        notes: `Quote #${quoteNumber} — ${quoteItem.category} | ${quoteItem.type === "equipment" ? "Equipment" : "Power Unit"} ID: ${id}`,
      });
    },
    onSuccess: () => {
      setQuoteSaved(true);
      queryClient.invalidateQueries({ queryKey: ["/api/portal/quotes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/portal/profile"] });
      toast({ title: "Quote Saved", description: "This quote has been saved to your portal." });
    },
    onError: () => {
      toast({ title: "Error", description: "Could not save quote. Please try again.", variant: "destructive" });
    },
  });

  useEffect(() => {
    if (isAuthenticated && quoteItem && !quoteSaved && !saveQuoteMutation.isPending) {
      saveQuoteMutation.mutate();
    }
  }, [isAuthenticated, quoteItem]);

  const emailMutation = useMutation({
    mutationFn: async (recipientEmail: string) => {
      return apiRequest("POST", "/api/quotes/send-email", {
        email: recipientEmail,
        itemType: type,
        itemId: id,
        quoteNumber,
        quoteDate: quoteDate.toISOString(),
      });
    },
    onSuccess: () => {
      setEmailSent(true);
      toast({
        title: "Quote Sent!",
        description: `The quote has been emailed to ${email}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to send",
        description: error.message || "Could not send the email. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handlePrint = () => {
    window.print();
  };

  const handleSendEmail = () => {
    if (!email || !email.includes("@")) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }
    emailMutation.mutate(email);
  };

  if (isLoading) {
    return (
      <div className="flash-page-transition max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <Skeleton className="h-6 w-40 mb-8" />
        <Skeleton className="h-[600px] w-full rounded-lg" />
      </div>
    );
  }

  if (!quoteItem) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center flash-page-transition">
        <h2 className="text-2xl font-bold mb-4">Item Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The item you're looking for doesn't exist or has been removed.
        </p>
        <Link href={isEquipment ? "/equipment/listings" : "/power-units/listings"}>
          <Button data-testid="button-back">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Listings
          </Button>
        </Link>
      </div>
    );
  }

  const validTo = new Date(quoteDate);
  validTo.setDate(validTo.getDate() + 30);

  return (
    <div className="flash-page-transition">
      <div className="bg-card border-b print:hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground" data-testid="breadcrumb">
            <Link href="/">
              <span className="cursor-pointer">Home</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href={isEquipment ? "/equipment/listings" : "/power-units/listings"}>
              <span className="cursor-pointer">{isEquipment ? "Equipment" : "Power Units"}</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-foreground font-medium">Quote</span>
          </nav>
        </div>
      </div>

      <div className="print:hidden bg-muted/30 border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center gap-3">
          <Link href={isEquipment ? `/equipment/details/${id}` : "/power-units/listings"}>
            <Button variant="outline" size="sm" className="gap-1.5" data-testid="button-back-listing">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
          <div className="flex-1" />
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={handlePrint}
            data-testid="button-print-quote"
          >
            <Printer className="w-4 h-4" />
            Print / Save PDF
          </Button>
          <Button
            size="sm"
            className="gap-1.5 bg-accent text-accent-foreground"
            onClick={() => {
              setEmailSent(false);
              setEmailOpen(true);
            }}
            data-testid="button-email-quote"
          >
            <Mail className="w-4 h-4" />
            Email Quote
          </Button>
          {isAuthenticated ? (
            <Button
              size="sm"
              variant={quoteSaved ? "outline" : "default"}
              className={quoteSaved ? "gap-1.5 text-green-600 border-green-300" : "gap-1.5"}
              onClick={() => !quoteSaved && saveQuoteMutation.mutate()}
              disabled={quoteSaved || saveQuoteMutation.isPending}
              data-testid="button-save-quote-portal"
            >
              {quoteSaved ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Saved to Portal
                </>
              ) : saveQuoteMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save to Portal
                </>
              )}
            </Button>
          ) : (
            <a href="/api/login" data-testid="link-save-quote-login">
              <Button size="sm" variant="outline" className="gap-1.5">
                <LogIn className="w-4 h-4" />
                Save Your Quote
              </Button>
            </a>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 print:p-0 print:max-w-none" ref={contentRef}>
        <div
          id="quote-template"
          className="bg-white text-black rounded-lg border print:border-none print:shadow-none print:rounded-none"
        >
          <div className="px-8 py-5 rounded-t-lg print:rounded-none flex items-center justify-between" style={{ backgroundColor: "#1a1a1a" }}>
            <div className="flex items-center gap-4">
              <img
                src={logoImg}
                alt="American Iron LLC"
                className="h-16 w-auto object-contain"
                style={{ filter: "drop-shadow(0 2px 8px rgba(255,205,17,0.3))" }}
                data-testid="img-quote-logo"
              />
            </div>
            <div className="text-right text-sm text-white/70">
              <div className="flex items-center gap-1.5 justify-end">
                <Phone className="w-3.5 h-3.5" />
                +1 (850) 777-3797
              </div>
              <div className="flex items-center gap-1.5 justify-end mt-1">
                <Mail className="w-3.5 h-3.5" />
                info@americanironus.com
              </div>
              <div className="flex items-center gap-1.5 justify-end mt-1">
                <MapPin className="w-3.5 h-3.5" />
                Tampa, Florida, USA
              </div>
              <div className="flex items-center gap-1.5 justify-end mt-1">
                <Globe className="w-3.5 h-3.5" />
                www.americanironus.com
              </div>
            </div>
          </div>
          <div className="h-1 w-full" style={{ backgroundColor: "#FFCD11" }} />

          <div className="px-8 py-6 border-b flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-black">QUOTATION</h2>
              <p className="text-gray-500 text-sm mt-0.5">Equipment Price Quote</p>
            </div>
            <div className="text-right text-sm">
              <div className="text-gray-500">
                Quote #: <span className="font-mono font-semibold text-black" data-testid="text-quote-number">{quoteNumber}</span>
              </div>
              <div className="text-gray-500 mt-1">
                Date: <span className="font-semibold text-black">{formatDate(quoteDate)}</span>
              </div>
              <div className="text-gray-500 mt-1">
                Valid Until: <span className="font-semibold text-black">{formatDate(validTo)}</span>
              </div>
            </div>
          </div>

          <div className="px-8 py-6 border-b">
            <div className="flex gap-6">
              {quoteItem.imageUrl && (
                <div className="w-48 h-36 rounded-md overflow-hidden bg-gray-100 shrink-0 print:w-40 print:h-32">
                  <img
                    src={quoteItem.imageUrl}
                    alt={quoteItem.title}
                    className="w-full h-full object-cover"
                    data-testid="img-quote-item"
                  />
                </div>
              )}
              <div className="flex-1">
                <div className="inline-block px-2.5 py-0.5 rounded text-xs font-semibold mb-2" style={{ backgroundColor: "#FFCD11", color: "#000" }}>
                  {quoteItem.category}
                </div>
                <h3 className="text-lg font-bold text-black" data-testid="text-quote-item-title">
                  {quoteItem.title}
                </h3>
                <p className="text-sm text-gray-500 mt-0.5" data-testid="text-quote-item-id">
                  {quoteItem.identifier}
                </p>
              </div>
            </div>
          </div>

          <div className="px-8 py-6 border-b">
            <h4 className="text-sm font-bold text-black uppercase tracking-wider mb-4">Specifications</h4>
            <table className="w-full text-sm" data-testid="table-specs">
              <tbody>
                {quoteItem.specs.map((spec, i) => (
                  <tr key={spec.label} className={i % 2 === 0 ? "bg-gray-50" : ""}>
                    <td className="py-2.5 px-4 text-gray-500 font-medium w-1/3">{spec.label}</td>
                    <td className="py-2.5 px-4 text-black font-semibold">{spec.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-8 py-6 border-b">
            <h4 className="text-sm font-bold text-black uppercase tracking-wider mb-4">Pricing</h4>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-black">
                  <th className="py-2 px-4 text-left text-black font-bold">Item</th>
                  <th className="py-2 px-4 text-center text-black font-bold">Qty</th>
                  <th className="py-2 px-4 text-right text-black font-bold">Unit Price</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-4 text-black">{quoteItem.title}</td>
                  <td className="py-3 px-4 text-center text-black">1</td>
                  <td className="py-3 px-4 text-right font-bold text-black" data-testid="text-quote-price">{quoteItem.price}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="bg-black text-white">
                  <td colSpan={2} className="py-3 px-4 font-bold text-right">Total</td>
                  <td className="py-3 px-4 text-right font-bold" style={{ color: "#FFCD11" }}>{quoteItem.price}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="px-8 py-6 border-b text-xs text-gray-500 space-y-2">
            <h4 className="text-sm font-bold text-black uppercase tracking-wider mb-3">Terms & Conditions</h4>
            <p>1. This quotation is valid for 30 days from the date of issue.</p>
            <p>2. Prices are quoted in USD and are subject to change without notice after the validity period.</p>
            <p>3. Shipping, freight, and handling charges are not included unless otherwise stated.</p>
            <p>4. Payment terms: Wire transfer or certified check. Terms to be discussed upon order confirmation.</p>
            <p>5. Equipment is sold as-is, where-is unless otherwise specified in a purchase agreement.</p>
            <p>6. American Iron LLC reserves the right to modify or withdraw this quotation at any time prior to acceptance.</p>
          </div>

          <div className="px-8 py-6 text-center text-xs text-gray-400">
            <p className="font-semibold text-gray-600 mb-1">American Iron LLC — Tampa, Florida</p>
            <p>Phone: +1 (850) 777-3797 | Email: info@americanironus.com | Web: www.americanironus.com</p>
            <p className="mt-2">Thank you for your interest. Contact us to finalize your order.</p>
          </div>
        </div>
      </div>

      <Dialog open={emailOpen} onOpenChange={setEmailOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Email This Quote</DialogTitle>
            <DialogDescription>
              We'll send a professional quote with a PDF attachment to your email address.
            </DialogDescription>
          </DialogHeader>
          {emailSent ? (
            <div className="flex flex-col items-center py-6 gap-3">
              <CheckCircle2 className="w-12 h-12 text-green-500" />
              <p className="text-center font-semibold">Quote sent successfully!</p>
              <p className="text-center text-sm text-muted-foreground">
                Check your inbox at <span className="font-medium">{email}</span>
              </p>
              <Button variant="outline" onClick={() => setEmailOpen(false)} data-testid="button-close-email-dialog">
                Close
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Email Address</label>
                <Input
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  data-testid="input-email-quote"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSendEmail();
                  }}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setEmailOpen(false)} data-testid="button-cancel-email">
                  Cancel
                </Button>
                <Button
                  className="gap-1.5 bg-accent text-accent-foreground"
                  onClick={handleSendEmail}
                  disabled={emailMutation.isPending}
                  data-testid="button-send-email"
                >
                  {emailMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      Send Quote
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
