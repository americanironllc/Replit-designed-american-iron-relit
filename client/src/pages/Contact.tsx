import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
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
import {
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  Send,
  Building2,
  ExternalLink,
} from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { useFlashReveal } from "@/hooks/useFlashReveal";

const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email required"),
  message: z.string().min(1, "Message is required"),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function Contact() {
  const { toast } = useToast();
  const heroRef = useFlashReveal();
  const contentRef = useFlashReveal();

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", message: "" },
  });

  const mutation = useMutation({
    mutationFn: async (data: ContactFormData) => {
      return apiRequest("POST", "/api/contact", data);
    },
    onSuccess: () => {
      toast({ title: "Inquiry Submitted", description: "A specialist will respond within one business day." });
      form.reset();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to submit. Please try again.", variant: "destructive" });
    },
  });

  return (
    <div className="flash-page-transition">
      <section className="relative py-20 overflow-hidden bg-primary" ref={heroRef}>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
          <h1 className="flash-reveal text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-foreground mb-4 tracking-tight" data-testid="text-contact-title">
            Global Headquarters
          </h1>
          <p className="flash-reveal text-primary-foreground/70 text-lg max-w-2xl" style={{ "--flash-index": 1 } as any}>
            Connect with our asset specialists for equipment acquisition, parts procurement, and specialized industrial services.
          </p>
        </div>
      </section>

      <section className="py-16" ref={contentRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-5 gap-12">
            <div className="lg:col-span-2 space-y-8">
              <div className="flash-reveal">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-accent" />
                  Corporate Office
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                  Our Tampa-based operations center manages all domestic and international accounts. We welcome inquiries regarding fleet liquidations, specific component sourcing, and logistics coordination.
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-accent mt-1 shrink-0" />
                    <div className="text-sm">
                      <div className="font-semibold">American Iron LLC</div>
                      <div className="text-muted-foreground">13930 N Dale Mabry Hwy, Suite 5</div>
                      <div className="text-muted-foreground">Tampa, FL 33618, USA</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flash-reveal" style={{ "--flash-index": 1 } as any}>
                <h3 className="font-semibold mb-4">Direct Channels</h3>
                <div className="space-y-4">
                  <Card className="flash-reveal-scale p-4 border-card-border" style={{ "--flash-index": 2 } as any}>
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-md bg-accent/10 flex items-center justify-center shrink-0">
                        <Phone className="w-4.5 h-4.5 text-accent" />
                      </div>
                      <div>
                        <div className="font-semibold text-sm">Executive Inquiries & Sales</div>
                        <a href="tel:+18507773797" className="text-sm text-accent" data-testid="link-contact-phone">
                          +1 (850) 777-3797
                        </a>
                      </div>
                    </div>
                  </Card>

                  <Card className="flash-reveal-scale p-4 border-card-border" style={{ "--flash-index": 3 } as any}>
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-md bg-accent/10 flex items-center justify-center shrink-0">
                        <Mail className="w-4.5 h-4.5 text-accent" />
                      </div>
                      <div>
                        <div className="font-semibold text-sm">Digital Correspondence</div>
                        <a href="mailto:info@americanironus.com" className="text-sm text-accent" data-testid="link-contact-email">
                          info@americanironus.com
                        </a>
                      </div>
                    </div>
                  </Card>

                  <Card className="flash-reveal-scale p-4 border-card-border" style={{ "--flash-index": 4 } as any}>
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-md bg-accent/10 flex items-center justify-center shrink-0">
                        <MessageCircle className="w-4.5 h-4.5 text-accent" />
                      </div>
                      <div>
                        <div className="font-semibold text-sm">Global Rapid Response</div>
                        <a href="https://wa.me/18132006088" className="text-sm text-accent" data-testid="link-contact-whatsapp">
                          WhatsApp: +1 813 200 6088
                        </a>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>

              <div className="flash-reveal" style={{ "--flash-index": 5 } as any}>
                <a
                  href="https://wa.me/18132006088"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                  data-testid="link-whatsapp-cta"
                >
                  <Card className="p-5 bg-green-600 dark:bg-green-700 border-green-500 hover:bg-green-700 dark:hover:bg-green-600 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                        <SiWhatsapp className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-white text-sm">Chat with us on WhatsApp</div>
                        <div className="text-white/80 text-xs mt-0.5">Get instant responses for quotes, parts inquiries, and equipment availability</div>
                        <div className="text-white/90 text-sm font-semibold mt-1">+1 813 200 6088</div>
                      </div>
                      <ExternalLink className="w-5 h-5 text-white/60 group-hover:text-white transition-colors shrink-0" />
                    </div>
                  </Card>
                </a>
              </div>
            </div>

            <div className="lg:col-span-3">
              <Card className="flash-reveal-scale p-6 border-card-border" style={{ "--flash-index": 1 } as any}>
                <h2 className="text-lg font-bold mb-2">Submit a Request for Information</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  A specialist relevant to your sector will respond within one business cycle.
                </p>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-5">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your full name" {...field} data-testid="input-contact-name" />
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
                          <FormLabel>Business Email Address</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="you@company.com" {...field} data-testid="input-contact-email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Project Specifications</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe your equipment or parts requirements..."
                              className="resize-none"
                              rows={5}
                              {...field}
                              data-testid="input-contact-message"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full bg-accent text-accent-foreground gap-2"
                      size="lg"
                      disabled={mutation.isPending}
                      data-testid="button-submit-contact"
                    >
                      {mutation.isPending ? "Submitting..." : (
                        <>
                          <Send className="w-4 h-4" />
                          Submit Inquiry
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
