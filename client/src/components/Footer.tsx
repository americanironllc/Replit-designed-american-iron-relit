import { Link } from "wouter";
import { Phone, Mail, MapPin, MessageCircle } from "lucide-react";
import { SiFacebook, SiX, SiInstagram, SiLinkedin, SiYoutube } from "react-icons/si";
import logoImg from "@assets/american_iron_new_logo_1771911523492.png";
import { useFlashReveal } from "@/hooks/useFlashReveal";

const socialLinks = [
  { icon: SiFacebook, href: "https://facebook.com/AMERICANIRONLLC", label: "Facebook" },
  { icon: SiX, href: "https://x.com/americanironn", label: "X" },
  { icon: SiInstagram, href: "https://instagram.com/americanyellowiron/", label: "Instagram" },
  { icon: SiLinkedin, href: "https://linkedin.com/in/americanironllc/", label: "LinkedIn" },
  { icon: SiYoutube, href: "https://youtube.com/@Americanironus", label: "YouTube" },
];

export default function Footer() {
  const footerRef = useFlashReveal();

  return (
    <footer className="bg-primary text-primary-foreground" ref={footerRef}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          <div className="flash-reveal" style={{ "--flash-index": 0 } as any}>
            <div className="flex items-center gap-3 mb-4">
              <img
                src={logoImg}
                alt="American Iron LLC"
                className="h-20 w-auto object-contain"
                style={{
                  filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5)) drop-shadow(0 6px 16px rgba(255,205,17,0.2))",
                }}
                data-testid="img-footer-logo"
              />
            </div>
            <p className="text-sm text-primary-foreground/70 leading-relaxed mb-5">
              Empowering global infrastructure through comprehensive parts inventory and unparalleled equipment procurement.
            </p>
            <div className="flex items-center gap-3" data-testid="footer-social-links">
              {socialLinks.map((s) => {
                const Icon = s.icon;
                return (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="w-8 h-8 rounded-full bg-primary-foreground/10 flex items-center justify-center text-primary-foreground/60 transition-all hover:bg-accent hover:text-accent-foreground"
                    data-testid={`footer-social-${s.label.toLowerCase()}`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </a>
                );
              })}
            </div>
          </div>

          <div className="flash-reveal" style={{ "--flash-index": 1 } as any}>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4 text-accent">Equipment & Parts</h4>
            <ul className="space-y-2.5">
              <FooterLink href="/equipment">Equipment Inventory</FooterLink>
              <FooterLink href="/parts">Parts Catalog</FooterLink>
              <FooterLink href="/power-units">Power Units & Generators</FooterLink>
              <FooterLink href="/quote">Request a Quote</FooterLink>
            </ul>
          </div>

          <div className="flash-reveal" style={{ "--flash-index": 2 } as any}>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4 text-accent">Services</h4>
            <ul className="space-y-2.5">
              <FooterLink href="/services/dismantling">Equipment Dismantling</FooterLink>
              <FooterLink href="/services/inspection">Inspection & Auditing</FooterLink>
              <FooterLink href="/services/transportation">Transportation</FooterLink>
              <FooterLink href="/services/shipping">Shipping & Forwarding</FooterLink>
            </ul>
          </div>

          <div className="flash-reveal" style={{ "--flash-index": 3 } as any}>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4 text-accent">IRON Estimator</h4>
            <ul className="space-y-2.5">
              <FooterLink href="/services/estimator">AI Estimator Tool</FooterLink>
              <FooterLink href="/quote">Request a Quote</FooterLink>
              <FooterLink href="/contact">Contact Us</FooterLink>
            </ul>
          </div>

          <div className="flash-reveal" style={{ "--flash-index": 4 } as any}>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4 text-accent">Contact</h4>
            <ul className="space-y-3 text-sm text-primary-foreground/70">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-accent" />
                <span>13930 N Dale Mabry Hwy, Suite 5<br />Tampa, FL 33618, USA</span>
              </li>
              <li>
                <a href="tel:+18507773797" className="flex items-center gap-2.5 transition-colors hover:text-accent" data-testid="footer-phone">
                  <Phone className="w-4 h-4 shrink-0 text-accent" />
                  +1 (850) 777-3797
                </a>
              </li>
              <li>
                <a href="mailto:info@americanironus.com" className="flex items-center gap-2.5 transition-colors hover:text-accent" data-testid="footer-email">
                  <Mail className="w-4 h-4 shrink-0 text-accent" />
                  info@americanironus.com
                </a>
              </li>
              <li>
                <a href="https://wa.me/18132006088" className="flex items-center gap-2.5 transition-colors hover:text-accent" data-testid="footer-whatsapp">
                  <MessageCircle className="w-4 h-4 shrink-0 text-accent" />
                  WhatsApp: +1 813 200 6088
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="flash-reveal mt-12 pt-8 border-t border-primary-foreground/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-primary-foreground/50" style={{ "--flash-index": 5 } as any}>
          <span>&copy; {new Date().getFullYear()} American Iron LLC. All rights reserved.</span>
          <span>Tampa, Florida | Heavy Equipment & Asset Management Solutions</span>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href}>
        <span className="text-sm text-primary-foreground/70 cursor-pointer transition-colors hover:text-accent py-1 inline-block">
          {children}
        </span>
      </Link>
    </li>
  );
}
