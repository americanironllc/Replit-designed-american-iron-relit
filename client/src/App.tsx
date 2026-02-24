import { useState, useCallback } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SplashScreen from "@/components/SplashScreen";
import Home from "@/pages/Home";
import EquipmentCategories from "@/pages/EquipmentCategories";
import EquipmentInventory from "@/pages/EquipmentInventory";
import EquipmentDetails from "@/pages/EquipmentDetails";
import PartsCatalog from "@/pages/PartsCatalog";
import PartsCategory from "@/pages/PartsCategory";
import QuoteRequest from "@/pages/QuoteRequest";
import ServiceDismantling from "@/pages/ServiceDismantling";
import ServiceInspection from "@/pages/ServiceInspection";
import ServiceTransportation from "@/pages/ServiceTransportation";
import ServiceShipping from "@/pages/ServiceShipping";
import Contact from "@/pages/Contact";
import ProjectEstimator from "@/pages/ProjectEstimator";
import PowerUnits from "@/pages/PowerUnits";
import PowerUnitsListings from "@/pages/PowerUnitsListings";
import QuotePreview from "@/pages/QuotePreview";
import CustomerPortal from "@/pages/CustomerPortal";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/equipment" component={EquipmentCategories} />
      <Route path="/equipment/listings" component={EquipmentInventory} />
      <Route path="/equipment/details/:id" component={EquipmentDetails} />
      <Route path="/parts" component={PartsCatalog} />
      <Route path="/parts/:category" component={PartsCategory} />
      <Route path="/quote" component={QuoteRequest} />
      <Route path="/services/dismantling" component={ServiceDismantling} />
      <Route path="/services/inspection" component={ServiceInspection} />
      <Route path="/services/transportation" component={ServiceTransportation} />
      <Route path="/services/shipping" component={ServiceShipping} />
      <Route path="/services/estimator" component={ProjectEstimator} />
      <Route path="/power-units" component={PowerUnits} />
      <Route path="/power-units/listings" component={PowerUnitsListings} />
      <Route path="/quote/item/:type/:id" component={QuotePreview} />
      <Route path="/portal" component={CustomerPortal} />
      <Route path="/contact" component={Contact} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [splashDone, setSplashDone] = useState(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem("ai-splash-shown")) return true;
    return false;
  });

  const handleSplashComplete = useCallback(() => {
    sessionStorage.setItem("ai-splash-shown", "1");
    setSplashDone(true);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {!splashDone && <SplashScreen onComplete={handleSplashComplete} />}
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1">
            <Router />
          </main>
          <Footer />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
