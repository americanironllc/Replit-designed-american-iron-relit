import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/auth-utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import logoImg from "@assets/american_iron_new_logo_1771911523492.png";
import {
  User,
  FileText,
  Package,
  CreditCard,
  MessageSquare,
  LogOut,
  ChevronRight,
  Clock,
  Mail,
  Shield,
  Loader2,
} from "lucide-react";
import type { QuoteRequest, CustomerOrder, CustomerPayment, ContactInquiry } from "@shared/schema";

type PortalTab = "dashboard" | "quotes" | "orders" | "payments" | "inquiries";

export default function CustomerPortal() {
  const { user, isLoading: authLoading, isAuthenticated, logout } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<PortalTab>("dashboard");

  const handleQueryError = (error: Error) => {
    if (isUnauthorizedError(error)) {
      toast({ title: "Session expired", description: "Please sign in again.", variant: "destructive" });
      setTimeout(() => { window.location.href = "/api/login"; }, 500);
    }
  };

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({ title: "Please sign in", description: "Redirecting to login...", variant: "destructive" });
      setTimeout(() => { window.location.href = "/api/login"; }, 500);
    }
  }, [authLoading, isAuthenticated, toast]);

  const profileQuery = useQuery<{ user: any; counts: { quotes: number; orders: number; payments: number; inquiries: number } }>({
    queryKey: ["/api/portal/profile"],
    enabled: isAuthenticated,
    retry: (count, error) => !isUnauthorizedError(error) && count < 2,
  });

  useEffect(() => { if (profileQuery.error) handleQueryError(profileQuery.error); }, [profileQuery.error]);

  const quotesQuery = useQuery<QuoteRequest[]>({
    queryKey: ["/api/portal/quotes"],
    enabled: isAuthenticated && (activeTab === "quotes" || activeTab === "dashboard"),
    retry: (count, error) => !isUnauthorizedError(error) && count < 2,
  });

  const ordersQuery = useQuery<CustomerOrder[]>({
    queryKey: ["/api/portal/orders"],
    enabled: isAuthenticated && (activeTab === "orders" || activeTab === "dashboard"),
    retry: (count, error) => !isUnauthorizedError(error) && count < 2,
  });

  const paymentsQuery = useQuery<CustomerPayment[]>({
    queryKey: ["/api/portal/payments"],
    enabled: isAuthenticated && (activeTab === "payments" || activeTab === "dashboard"),
    retry: (count, error) => !isUnauthorizedError(error) && count < 2,
  });

  const inquiriesQuery = useQuery<ContactInquiry[]>({
    queryKey: ["/api/portal/inquiries"],
    enabled: isAuthenticated && (activeTab === "inquiries" || activeTab === "dashboard"),
    retry: (count, error) => !isUnauthorizedError(error) && count < 2,
  });

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const profile = profileQuery.data;
  const displayName = user?.firstName
    ? `${user.firstName}${user.lastName ? ` ${user.lastName}` : ""}`
    : user?.email || "Customer";

  const tabs: { id: PortalTab; label: string; icon: typeof FileText; count?: number }[] = [
    { id: "dashboard", label: "Dashboard", icon: User },
    { id: "quotes", label: "Quote History", icon: FileText, count: profile?.counts.quotes },
    { id: "orders", label: "Orders", icon: Package, count: profile?.counts.orders },
    { id: "payments", label: "Payments", icon: CreditCard, count: profile?.counts.payments },
    { id: "inquiries", label: "Inquiries", icon: MessageSquare, count: profile?.counts.inquiries },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      <section className="bg-primary py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-4 mb-6">
            <img
              src={logoImg}
              alt="American Iron LLC"
              className="h-14 w-auto object-contain"
              style={{ filter: "drop-shadow(0 2px 6px rgba(255,205,17,0.3))" }}
              data-testid="img-portal-logo"
            />
            <div className="h-10 w-px bg-primary-foreground/20" />
            <span className="text-primary-foreground/60 text-sm font-medium uppercase tracking-wider">Customer Portal</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {user?.profileImageUrl ? (
                <img
                  src={user.profileImageUrl}
                  alt={displayName}
                  className="w-14 h-14 rounded-full border-2 border-accent object-cover"
                  data-testid="img-user-avatar"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-accent/20 flex items-center justify-center border-2 border-accent">
                  <User className="w-7 h-7 text-accent" />
                </div>
              )}
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-primary-foreground" data-testid="text-portal-welcome">
                  Welcome, {displayName}
                </h1>
                <p className="text-primary-foreground/60 text-sm" data-testid="text-portal-email">{user?.email}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
              onClick={() => logout()}
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4 mr-1.5" />
              Sign Out
            </Button>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid lg:grid-cols-5 gap-8">
          <div className="lg:col-span-1">
            <nav className="space-y-1" data-testid="nav-portal-tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      activeTab === tab.id
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                    data-testid={`tab-${tab.id}`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="flex-1 text-left">{tab.label}</span>
                    {tab.count !== undefined && tab.count > 0 && (
                      <Badge variant="secondary" className="ml-auto text-xs">{tab.count}</Badge>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="lg:col-span-4">
            {activeTab === "dashboard" && (
              <DashboardView
                profile={profile}
                quotes={quotesQuery.data}
                orders={ordersQuery.data}
                payments={paymentsQuery.data}
                inquiries={inquiriesQuery.data}
                onTabChange={setActiveTab}
                isLoading={profileQuery.isLoading}
              />
            )}
            {activeTab === "quotes" && <QuotesView quotes={quotesQuery.data} isLoading={quotesQuery.isLoading} />}
            {activeTab === "orders" && <OrdersView orders={ordersQuery.data} isLoading={ordersQuery.isLoading} />}
            {activeTab === "payments" && <PaymentsView payments={paymentsQuery.data} isLoading={paymentsQuery.isLoading} />}
            {activeTab === "inquiries" && <InquiriesView inquiries={inquiriesQuery.data} isLoading={inquiriesQuery.isLoading} />}
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardView({
  profile,
  quotes,
  orders,
  payments,
  inquiries,
  onTabChange,
  isLoading,
}: {
  profile: any;
  quotes?: QuoteRequest[];
  orders?: CustomerOrder[];
  payments?: CustomerPayment[];
  inquiries?: ContactInquiry[];
  onTabChange: (tab: PortalTab) => void;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
      </div>
    );
  }

  const stats = [
    { label: "Quote Requests", value: profile?.counts.quotes || 0, icon: FileText, tab: "quotes" as PortalTab, color: "text-blue-500" },
    { label: "Orders", value: profile?.counts.orders || 0, icon: Package, tab: "orders" as PortalTab, color: "text-green-500" },
    { label: "Payments", value: profile?.counts.payments || 0, icon: CreditCard, tab: "payments" as PortalTab, color: "text-purple-500" },
    { label: "Inquiries", value: profile?.counts.inquiries || 0, icon: MessageSquare, tab: "inquiries" as PortalTab, color: "text-orange-500" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.label}
              className="p-5 cursor-pointer hover:border-accent/50 transition-colors"
              onClick={() => onTabChange(stat.tab)}
              data-testid={`card-stat-${stat.tab}`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-lg bg-muted ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold" data-testid={`text-count-${stat.tab}`}>{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm">Recent Quote Requests</h3>
            <button onClick={() => onTabChange("quotes")} className="text-xs text-accent flex items-center gap-1" data-testid="link-view-all-quotes">
              View All <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          {!quotes || quotes.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No quote requests yet</p>
          ) : (
            <div className="space-y-3">
              {quotes.slice(0, 3).map((q) => (
                <div key={q.id} className="flex items-start justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{q.items || "General Inquiry"}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {q.createdAt ? new Date(q.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A"}
                    </p>
                  </div>
                  <StatusBadge status={q.status || "pending"} />
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm">Recent Inquiries</h3>
            <button onClick={() => onTabChange("inquiries")} className="text-xs text-accent flex items-center gap-1" data-testid="link-view-all-inquiries">
              View All <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          {!inquiries || inquiries.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No inquiries yet</p>
          ) : (
            <div className="space-y-3">
              {inquiries.slice(0, 3).map((inq) => (
                <div key={inq.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <Mail className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm truncate">{inq.message}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {inq.createdAt ? new Date(inq.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card className="p-5 border-accent/20 bg-accent/5">
        <div className="flex items-start gap-4">
          <Shield className="w-8 h-8 text-accent shrink-0" />
          <div>
            <h3 className="font-semibold text-sm mb-1">Your Account is Secure</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              All your data is encrypted and stored securely. Your quote requests, order history, and payment records are only accessible to you and authorized American Iron LLC staff.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

function QuotesView({ quotes, isLoading }: { quotes?: QuoteRequest[]; isLoading: boolean }) {
  if (isLoading) return <LoadingState />;

  return (
    <div>
      <h2 className="text-lg font-bold mb-4" data-testid="text-quotes-title">Quote Request History</h2>
      {!quotes || quotes.length === 0 ? (
        <EmptyState icon={FileText} message="No quote requests yet" description="Submit a quote request from our parts catalog or equipment listings to see it here." />
      ) : (
        <div className="space-y-3">
          {quotes.map((q) => (
            <Card key={q.id} className="p-5" data-testid={`quote-item-${q.id}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">Quote #{q.id}</span>
                    <StatusBadge status={q.status || "pending"} />
                  </div>
                  {q.items && <p className="text-sm text-muted-foreground font-mono mb-1">{q.items}</p>}
                  {q.shipTo && <p className="text-xs text-muted-foreground">Ship to: {q.shipTo}</p>}
                  {q.notes && <p className="text-xs text-muted-foreground mt-1">Notes: {q.notes}</p>}
                </div>
                <div className="text-right shrink-0">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {q.createdAt ? new Date(q.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A"}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function OrdersView({ orders, isLoading }: { orders?: CustomerOrder[]; isLoading: boolean }) {
  if (isLoading) return <LoadingState />;

  return (
    <div>
      <h2 className="text-lg font-bold mb-4" data-testid="text-orders-title">Order History</h2>
      {!orders || orders.length === 0 ? (
        <EmptyState icon={Package} message="No orders yet" description="Once you place an order, it will appear here with tracking and status updates." />
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <Card key={o.id} className="p-5" data-testid={`order-item-${o.id}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">Order #{o.id}</span>
                    <StatusBadge status={o.status} />
                  </div>
                  {o.itemDescription && <p className="text-sm text-muted-foreground">{o.itemDescription}</p>}
                  {o.total && <p className="text-sm font-semibold mt-1">${Number(o.total).toLocaleString()}</p>}
                </div>
                <div className="text-right shrink-0">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {o.createdAt ? new Date(o.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A"}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function PaymentsView({ payments, isLoading }: { payments?: CustomerPayment[]; isLoading: boolean }) {
  if (isLoading) return <LoadingState />;

  return (
    <div>
      <h2 className="text-lg font-bold mb-4" data-testid="text-payments-title">Payment History</h2>
      {!payments || payments.length === 0 ? (
        <EmptyState icon={CreditCard} message="No payments yet" description="Your payment records will appear here once transactions are processed." />
      ) : (
        <div className="space-y-3">
          {payments.map((p) => (
            <Card key={p.id} className="p-5" data-testid={`payment-item-${p.id}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">Payment #{p.id}</span>
                    <StatusBadge status={p.status} />
                  </div>
                  <p className="text-lg font-bold text-accent">${Number(p.amount).toLocaleString()}</p>
                  {p.method && <p className="text-xs text-muted-foreground mt-0.5">Method: {p.method}</p>}
                  {p.reference && <p className="text-xs text-muted-foreground">Ref: {p.reference}</p>}
                </div>
                <div className="text-right shrink-0">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {p.paidAt ? new Date(p.paidAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : p.createdAt ? new Date(p.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A"}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function InquiriesView({ inquiries, isLoading }: { inquiries?: ContactInquiry[]; isLoading: boolean }) {
  if (isLoading) return <LoadingState />;

  return (
    <div>
      <h2 className="text-lg font-bold mb-4" data-testid="text-inquiries-title">Contact Inquiries</h2>
      {!inquiries || inquiries.length === 0 ? (
        <EmptyState icon={MessageSquare} message="No inquiries yet" description="Contact inquiries submitted with your email address will appear here." />
      ) : (
        <div className="space-y-3">
          {inquiries.map((inq) => (
            <Card key={inq.id} className="p-5" data-testid={`inquiry-item-${inq.id}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="text-sm">{inq.message}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {inq.createdAt ? new Date(inq.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A"}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    processing: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    shipped: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
    paid: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    failed: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    cancelled: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${styles[status] || styles.pending}`} data-testid={`badge-status-${status}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function EmptyState({ icon: Icon, message, description }: { icon: typeof FileText; message: string; description: string }) {
  return (
    <Card className="p-12 text-center">
      <Icon className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
      <h3 className="font-semibold text-sm mb-1">{message}</h3>
      <p className="text-xs text-muted-foreground max-w-sm mx-auto">{description}</p>
    </Card>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-6 h-6 animate-spin text-accent" />
    </div>
  );
}
