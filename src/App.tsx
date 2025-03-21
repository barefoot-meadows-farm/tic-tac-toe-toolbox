
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Collection from "./pages/Collection";
import GameDetails from "./pages/GameDetails";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import AnimatedTransition from "./components/AnimatedTransition";
import { PaywallProvider } from "./contexts/PaywallContext";
import GamePage from "./pages/GamePage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <PaywallProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route 
              path="/" 
              element={
                <AnimatedTransition>
                  <Index />
                </AnimatedTransition>
              } 
            />
            <Route 
              path="/collection" 
              element={
                <AnimatedTransition>
                  <Collection />
                </AnimatedTransition>
              } 
            />
            <Route 
              path="/game/:id" 
              element={
                <AnimatedTransition>
                  <GameDetails />
                </AnimatedTransition>
              } 
            />
            <Route 
              path="/play/:id" 
              element={
                <AnimatedTransition>
                  <GamePage />
                </AnimatedTransition>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <AnimatedTransition>
                  <Settings />
                </AnimatedTransition>
              } 
            />
            <Route 
              path="*" 
              element={
                <AnimatedTransition>
                  <NotFound />
                </AnimatedTransition>
              } 
            />
          </Routes>
        </BrowserRouter>
      </PaywallProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
