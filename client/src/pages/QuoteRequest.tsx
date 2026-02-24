import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { FileText, Send, CheckCircle2, X, Minus, Plus, Save, LogIn, User } from "lucide-react";
import { useFlashReveal } from "@/hooks/useFlashReveal";
import { useQuoteCart } from "@/hooks/useQuoteCart";
import { useAuth } from "@/hooks/use-auth";

const quoteSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().optional(),
  shipTo: z.string().optional(),
  notes: z.string().optional(),
  items: z.string().optional(),
});

type QuoteFormData = z.infer<typeof quoteSchema>;

export default function QuoteRequest() {
  const { toast } = useToast();
  const heroRef = useFlashReveal();
  const contentRef = useFlashReveal();
  const { items: cartItems, removeItem, updateQuantity, clearCart } = useQuoteCart();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [lastUserId, setLastUserId] = useState<string | null>(null);

  const form = useForm<QuoteFormData>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      shipTo: "",
      notes: "",
      items: "",
    },
  });

  useEffect(() => {
    if (isAuthenticated && user) {
      const userId = user.id || user.email || "";
      if (userId !== lastUserId) {
        const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ");
        if (fullName) form.setValue("name", fullName);
        if (user.email) form.setValue("email", user.email);
        setLastUserId(userId);
      }
    } else if (!isAuthenticated && lastUserId) {
      setLastUserId(null);
    }
  }, [isAuthenticated, user, form, lastUserId]);

  useEffect(() => {
    if (cartItems.length > 0) {
      const itemsText = cartItems
        .map((item) => `${item.partNumber} x${item.quantity}`)
        .join(", ");
      form.setValue("items", itemsText);
    } else {
      form.setValue("items", "");
    }
  }, [cartItems, form]);

  const mutation = useMutation({
    mutationFn: async (data: QuoteFormData) => {
      return apiRequest("POST", "/api/quotes", data);
    },
    onSuccess: () => {
      toast({ title: "Quote Request Sent", description: "We'll respond within one business day." + (isAuthenticated ? " Your quote has been saved to your portal." : "") });
      form.reset();
      clearCart();
      if (isAuthenticated) {
        queryClient.invalidateQueries({ queryKey: ["/api/portal/quotes"] });
        queryClient.invalidateQueries({ queryKey: ["/api/portal/profile"] });
      }
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to submit. Please try again.", variant: "destructive" });
    },
  });

  return (
    <div className="flash-page-transition">
      <section className="relative py-20 overflow-hidden" ref={heroRef}>
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url(/images/hero-parts.png)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/70 to-black/50" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
          <h1 className="flash-reveal text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight" data-testid="text-quote-title">
            Request Parts Quote
          </h1>
          <p className="flash-reveal text-white/70 text-lg max-w-2xl" style={{ "--flash-index": 1 } as any}>
            Send part numbers, quantities, and delivery details for a comprehensive quote.
          </p>
        </div>
      </section>

      {cartItems.length > 0 && (
        <section className="py-6 border-b bg-muted/30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Quote Items ({cartItems.length})</h2>
              <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={clearCart} data-testid="button-clear-cart">
                Clear All
              </Button>
            </div>
            <div className="space-y-2">
              {cartItems.map((item) => (
                <div key={item.partNumber} className="flex items-center gap-3 bg-card rounded-lg p-3 border" data-testid={`cart-item-${item.partNumber}`}>
                  <div className="flex-1 min-w-0">
                    <span className="font-mono font-medium text-accent text-sm">{item.partNumber}</span>
                    <span className="text-muted-foreground text-xs ml-2">{item.description}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => updateQuantity(item.partNumber, item.quantity - 1)}
                      className="w-6 h-6 rounded border flex items-center justify-center hover:bg-muted transition-colors"
                      disabled={item.quantity <= 1}
                      data-testid={`button-qty-minus-${item.partNumber}`}
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center text-sm font-medium" data-testid={`text-qty-${item.partNumber}`}>{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.partNumber, item.quantity + 1)}
                      className="w-6 h-6 rounded border flex items-center justify-center hover:bg-muted transition-colors"
                      data-testid={`button-qty-plus-${item.partNumber}`}
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.partNumber)}
                    className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors"
                    data-testid={`button-remove-${item.partNumber}`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-12" ref={contentRef}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2">
              <h2 className="flash-reveal text-xl font-bold mb-4">What to Include</h2>
              <ul className="space-y-3 text-sm text-muted-foreground flash-stagger">
                {[
                  "Part numbers and quantities",
                  "Machine model/serial (if available)",
                  "Shipping destination (city/state/country)",
                  "Preferred delivery time",
                ].map((item, i) => (
                  <li key={i} className="flash-reveal-left flex items-start gap-2.5" style={{ "--flash-index": i } as any}>
                    <CheckCircle2 className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <Card className="flash-reveal-scale mt-6 p-5 border-card-border" style={{ "--flash-index": 2 } as any}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-accent/10 rounded-md flex items-center justify-center">
                    <FileText className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">Need help?</div>
                    <div className="text-xs text-muted-foreground">Contact our specialists</div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Call +1 (850) 777-3797 or email info@americanironus.com for immediate assistance.
                </p>
              </Card>
            </div>

            <div className="lg:col-span-3">
              <Card className="flash-reveal-scale p-6 border-card-border" style={{ "--flash-index": 1 } as any}>
                <h2 className="text-lg font-bold mb-6">Send Quote Request</h2>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-5">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your name" {...field} data-testid="input-quote-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="you@company.com" {...field} data-testid="input-quote-email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone / WhatsApp</FormLabel>
                          <FormControl>
                            <Input placeholder="+1 (xxx) xxx-xxxx" {...field} data-testid="input-quote-phone" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="shipTo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ship To (City/State/Country)</FormLabel>
                          <FormControl>
                            <Input placeholder="Tampa, FL, USA" {...field} data-testid="input-quote-shipto" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="items"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Part Numbers & Quantities</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="e.g. 5P-8500 x2, 1R-0750 x1"
                              className="resize-none"
                              rows={3}
                              {...field}
                              data-testid="input-quote-items"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes (optional)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Any additional details..."
                              className="resize-none"
                              rows={3}
                              {...field}
                              data-testid="input-quote-notes"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {isAuthenticated ? (
                      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 flex items-center gap-2 text-sm" data-testid="text-logged-in-notice">
                        <User className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0" />
                        <span className="text-green-700 dark:text-green-300">
                          Signed in as <strong>{user?.email}</strong> — this quote will be saved to your portal.
                        </span>
                      </div>
                    ) : (
                      <a href="/api/login" className="block" data-testid="link-save-quote-login">
                        <div className="bg-muted/50 border border-border rounded-lg p-3 flex items-center gap-2 text-sm cursor-pointer hover:bg-muted transition-colors">
                          <LogIn className="w-4 h-4 text-accent shrink-0" />
                          <span className="text-muted-foreground">
                            <strong className="text-foreground">Save Your Quote</strong> — Sign in to save this quote to your account for future reference.
                          </span>
                        </div>
                      </a>
                    )}

                    <Button
                      type="submit"
                      className="w-full bg-accent text-accent-foreground gap-2"
                      size="lg"
                      disabled={mutation.isPending}
                      data-testid="button-submit-quote"
                    >
                      {mutation.isPending ? "Sending..." : (
                        <>
                          <Send className="w-4 h-4" />
                          Send Quote Request
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
