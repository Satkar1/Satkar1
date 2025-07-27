import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState, useEffect, createContext, useContext } from "react";
import Home from "@/pages/home";
import SearchPage from "@/pages/search";
import VendorDashboard from "@/pages/vendor-dashboard";
import SupplierDashboard from "@/pages/supplier-dashboard";
import OrderTracking from "@/pages/order-tracking";
import EmergencyOrder from "@/pages/emergency-order";
import NotFound from "@/pages/not-found";
import type { AppState, NavigationState } from "@/types";

// App Context
const AppContext = createContext<{
  appState: AppState;
  setAppState: (state: Partial<AppState>) => void;
  navigationState: NavigationState;
  setNavigationState: (state: Partial<NavigationState>) => void;
} | null>(null);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within AppProvider");
  }
  return context;
};

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/search" component={SearchPage} />
      <Route path="/vendor" component={VendorDashboard} />
      <Route path="/supplier" component={SupplierDashboard} />
      <Route path="/order/:id" component={OrderTracking} />
      <Route path="/emergency" component={EmergencyOrder} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppProvider({ children }: { children: React.ReactNode }) {
  const [appState, setAppStateInternal] = useState<AppState>({
    user: null,
    location: null,
    isOnline: navigator.onLine,
    notifications: [],
    activeOrders: [],
    nearbySuppliers: [],
  });

  const [navigationState, setNavigationStateInternal] = useState<NavigationState>({
    currentPage: 'home',
    userType: 'vendor',
  });

  const setAppState = (newState: Partial<AppState>) => {
    setAppStateInternal(prev => ({ ...prev, ...newState }));
  };

  const setNavigationState = (newState: Partial<NavigationState>) => {
    setNavigationStateInternal(prev => ({ ...prev, ...newState }));
  };

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => setAppState({ isOnline: true });
    const handleOffline = () => setAppState({ isOnline: false });

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setAppState]);

  return (
    <AppContext.Provider value={{
      appState,
      setAppState,
      navigationState,
      setNavigationState,
    }}>
      {children}
    </AppContext.Provider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppProvider>
          <Toaster />
          <Router />
        </AppProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
