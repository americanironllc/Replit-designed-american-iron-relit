import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Phone, Mail, ChevronDown, User, LogIn } from "lucide-react";
import { SiFacebook, SiX, SiInstagram, SiLinkedin, SiYoutube, SiWhatsapp } from "react-icons/si";
import logoImg from "@assets/american_iron_new_logo_1771911523492.png";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const services = [
  { name: "Equipment Dismantling", href: "/services/dismantling" },
  { name: "Inspection & Auditing", href: "/services/inspection" },
  { name: "Transportation", href: "/services/transportation" },
  { name: "Shipping & Forwarding", href: "/services/shipping" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const servicesRef = useRef<HTMLDivElement>(null);
  const [location, setLoc] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (servicesRef.current && !servicesRef.current.contains(e.target as Node)) {
        setServicesOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <div className="bg-primary text-primary-foreground text-sm hidden lg:block">
        <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-between gap-4">
          <span className="text-primary-foreground/80">
            Heavy Equipment & Asset Management Solutions
          </span>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2.5" data-testid="nav-social-links">
              <a href="https://facebook.com/AMERICANIRONLLC" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-primary-foreground/70 hover:text-accent transition-colors" data-testid="nav-social-facebook"><SiFacebook className="w-3.5 h-3.5" /></a>
              <a href="https://x.com/americanironn" target="_blank" rel="noopener noreferrer" aria-label="X" className="text-primary-foreground/70 hover:text-accent transition-colors" data-testid="nav-social-x"><SiX className="w-3.5 h-3.5" /></a>
              <a href="https://instagram.com/americanyellowiron/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-primary-foreground/70 hover:text-accent transition-colors" data-testid="nav-social-instagram"><SiInstagram className="w-3.5 h-3.5" /></a>
              <a href="https://linkedin.com/in/americanironllc/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-primary-foreground/70 hover:text-accent transition-colors" data-testid="nav-social-linkedin"><SiLinkedin className="w-3.5 h-3.5" /></a>
              <a href="https://youtube.com/@Americanironus" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="text-primary-foreground/70 hover:text-accent transition-colors" data-testid="nav-social-youtube"><SiYoutube className="w-3.5 h-3.5" /></a>
            </div>
            <span className="w-px h-4 bg-primary-foreground/20" />
            <a
              href="tel:+18507773797"
              className="flex items-center gap-1.5 text-primary-foreground/90 transition-colors hover:text-accent"
              data-testid="link-phone"
            >
              <Phone className="w-3.5 h-3.5" />
              +1 (850) 777-3797
            </a>
            <a
              href="mailto:info@americanironus.com"
              className="flex items-center gap-1.5 text-primary-foreground/90 transition-colors hover:text-accent"
              data-testid="link-email"
            >
              <Mail className="w-3.5 h-3.5" />
              info@americanironus.com
            </a>
          </div>
        </div>
      </div>

      <header className="flash-navbar sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b" style={{ animationDelay: "0.1s" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-18 lg:h-20">
            <Link href="/" data-testid="link-home">
              <div className="flex items-center gap-2 cursor-pointer">
                <img
                  src={logoImg}
                  alt="American Iron LLC"
                  className="h-16 w-auto object-contain drop-shadow-[0_4px_12px_rgba(255,205,17,0.3)]"
                  style={{
                    filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.4)) drop-shadow(0 6px 12px rgba(255,205,17,0.15))",
                  }}
                  data-testid="img-logo"
                />
              </div>
            </Link>

            <nav className="hidden lg:flex items-center gap-1" data-testid="nav-desktop">
              <NavLink href="/" active={location === "/"}>Home</NavLink>
              <NavLink href="/equipment" active={location.startsWith("/equipment")}>Equipment</NavLink>
              <NavLink href="/parts" active={location === "/parts"}>Parts</NavLink>
              <NavLink href="/power-units" active={location.startsWith("/power-units")}>Power Units</NavLink>

              <div className="relative" ref={servicesRef}>
                <button
                  onClick={() => setServicesOpen(!servicesOpen)}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-1 ${
                    location.startsWith("/services") && location !== "/services/estimator"
                      ? "text-accent"
                      : "text-foreground/70"
                  }`}
                  data-testid="button-services-menu"
                >
                  Services
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${servicesOpen ? "rotate-180" : ""}`} />
                </button>
                {servicesOpen && (
                  <div className="absolute top-full left-0 mt-1 w-56 rounded-md border bg-popover p-1 text-popover-foreground shadow-md" style={{ zIndex: 9999 }}>
                    {services.map((s) => (
                      <Link key={s.href} href={s.href} onClick={() => setServicesOpen(false)}>
                        <div
                          className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                          data-testid={`link-${s.href.split("/").pop()}`}
                        >
                          {s.name}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <NavLink href="/services/estimator" active={location === "/services/estimator"}>IRON Estimator</NavLink>
              <NavLink href="/contact" active={location === "/contact"}>Contact</NavLink>
            </nav>

            <div className="flex items-center gap-3">
              <a
                href="https://wa.me/18132006088"
                target="_blank"
                rel="noopener noreferrer"
                data-testid="button-whatsapp-nav"
              >
                <Button size="sm" variant="outline" className="hidden sm:flex gap-1.5 border-green-500 text-green-600 hover:bg-green-500 hover:text-white dark:border-green-400 dark:text-green-400 dark:hover:bg-green-500 dark:hover:text-white">
                  <SiWhatsapp className="w-4 h-4" />
                  WhatsApp
                </Button>
              </a>
              <Link href="/quote">
                <Button size="sm" className="hidden sm:flex bg-accent text-accent-foreground flash-glow-pulse" data-testid="button-get-quote">
                  Request Quote
                </Button>
              </Link>

              {isAuthenticated ? (
                <>
                  <Link href="/portal">
                    <Button size="sm" variant="outline" className="hidden sm:flex gap-1.5" data-testid="button-my-portal">
                      <User className="w-3.5 h-3.5" />
                      My Portal
                    </Button>
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center gap-1.5 px-2 py-1.5 rounded-md hover:bg-muted transition-colors" data-testid="button-user-menu">
                        {user?.profileImageUrl ? (
                          <img src={user.profileImageUrl} alt="" className="w-7 h-7 rounded-full object-cover" />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center">
                            <User className="w-4 h-4 text-accent" />
                          </div>
                        )}
                        <ChevronDown className="w-3 h-3 text-muted-foreground hidden sm:block" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <div className="px-2 py-1.5 text-xs text-muted-foreground truncate">
                        {user?.email || user?.firstName || "Account"}
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="cursor-pointer" onSelect={() => setLoc("/portal")} data-testid="link-my-portal">
                        <User className="w-4 h-4 mr-2" /> My Portal
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="cursor-pointer text-destructive" onSelect={() => logout()} data-testid="link-logout">
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <a href="/api/login" data-testid="button-sign-in">
                  <Button size="sm" variant="outline" className="hidden sm:flex gap-1.5">
                    <LogIn className="w-3.5 h-3.5" />
                    Sign In
                  </Button>
                </a>
              )}

              <button
                className="lg:hidden p-2"
                onClick={() => setMobileOpen(!mobileOpen)}
                data-testid="button-mobile-menu"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {mobileOpen && (
          <div className="lg:hidden border-t bg-background">
            <div className="px-4 py-3 space-y-1">
              <MobileLink href="/" onClick={() => setMobileOpen(false)}>Home</MobileLink>
              <MobileLink href="/equipment" onClick={() => setMobileOpen(false)}>Equipment Inventory</MobileLink>
              <MobileLink href="/parts" onClick={() => setMobileOpen(false)}>Parts Catalog</MobileLink>
              <MobileLink href="/power-units" onClick={() => setMobileOpen(false)}>Power Units & Generators</MobileLink>
              <div className="py-1 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Services</div>
              {services.map((s) => (
                <MobileLink key={s.href} href={s.href} onClick={() => setMobileOpen(false)}>
                  {s.name}
                </MobileLink>
              ))}
              <MobileLink href="/services/estimator" onClick={() => setMobileOpen(false)}>IRON Estimator</MobileLink>
              <MobileLink href="/quote" onClick={() => setMobileOpen(false)}>Request Quote</MobileLink>
              <a
                href="https://wa.me/18132006088"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium rounded-md text-green-600 dark:text-green-400 transition-colors hover:bg-green-50 dark:hover:bg-green-900/20"
                onClick={() => setMobileOpen(false)}
                data-testid="mobile-link-whatsapp"
              >
                <SiWhatsapp className="w-4 h-4" />
                WhatsApp Us
              </a>
              <MobileLink href="/contact" onClick={() => setMobileOpen(false)}>Contact Us</MobileLink>
              <div className="border-t my-2" />
              {isAuthenticated ? (
                <>
                  <MobileLink href="/portal" onClick={() => setMobileOpen(false)}>My Portal</MobileLink>
                  <button
                    onClick={() => { setMobileOpen(false); logout(); }}
                    className="block px-3 py-2.5 text-sm font-medium rounded-md cursor-pointer transition-colors hover:bg-muted text-left text-destructive"
                    data-testid="mobile-link-logout"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <a href="/api/login" className="block px-3 py-2.5 text-sm font-medium rounded-md cursor-pointer transition-colors hover:bg-muted" data-testid="mobile-link-sign-in">
                  Sign In
                </a>
              )}
              <div className="pt-3 flex flex-col gap-2 text-sm text-muted-foreground">
                <a href="tel:+18507773797" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" /> +1 (850) 777-3797
                </a>
                <a href="mailto:info@americanironus.com" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" /> info@americanironus.com
                </a>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}

function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link href={href}>
      <span
        className={`px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 cursor-pointer hover:text-accent ${
          active ? "text-accent" : "text-foreground/70"
        }`}
      >
        {children}
      </span>
    </Link>
  );
}

function MobileLink({ href, onClick, children }: { href: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <Link href={href} onClick={onClick}>
      <span className="block px-3 py-2.5 text-sm font-medium rounded-md cursor-pointer transition-colors hover:bg-muted">
        {children}
      </span>
    </Link>
  );
}
