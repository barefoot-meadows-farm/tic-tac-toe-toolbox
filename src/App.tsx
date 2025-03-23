
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
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import { AuthProvider } from "./contexts/AuthContext";
import { ErrorBoundary } from 'react-error-boundary';

const queryClient = new QueryClient();


const ErrorFallback = ({ error }) => {
    return (
        <div className="p-4 text-red-500">
            <h2>Something went wrong:</h2>
            <pre>{error.message}</pre>
        </div>
    );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
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
                  <ErrorBoundary FallbackComponent={ErrorFallback}>
                    <AnimatedTransition>
                      <GamePage />
                    </AnimatedTransition>
                  </ErrorBoundary>
                }
              />
                <Route
                    path="/settings"
                    element={
                        <ErrorBoundary FallbackComponent={ErrorFallback}>
                            <AnimatedTransition>
                                <Settings />
                            </AnimatedTransition>
                        </ErrorBoundary>
                    }
                />
                <Route
                    path="/auth"
                    element={
                        <ErrorBoundary FallbackComponent={ErrorFallback}>
                            <AnimatedTransition>
                                <Auth />
                            </AnimatedTransition>
                        </ErrorBoundary>
                    }
                />
                <Route
                    path="/profile"
                    element={
                        <ErrorBoundary FallbackComponent={ErrorFallback}>
                            <AnimatedTransition>
                                <Profile />
                            </AnimatedTransition>
                        </ErrorBoundary>
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
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
