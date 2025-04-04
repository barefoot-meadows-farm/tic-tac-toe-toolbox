
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { Menu, X, Home, Settings, Loader2, Heart, Gamepad2 } from 'lucide-react';
import { AuthButton } from './AuthButton';
import { useAuth } from '@/contexts/AuthContext';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const isMobile = useIsMobile();
  const { isLoading } = useAuth();
  
  const handleDonateClick = () => {
    // You can add analytics tracking here if needed
    console.log('Donate button clicked in navbar');
  };
  
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);
  
  useEffect(() => {
    if (!isMobile) {
      setIsMenuOpen(false);
    }
  }, [isMobile]);

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-md shadow-sm">
      <div className="container mx-auto px-4 md:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link to="/" className="flex items-center space-x-2">
              <Gamepad2 className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg md:text-xl">Tic Tac Toolbox</span>
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center space-x-1">
            <Button variant="ghost" size="sm" asChild>
              <Link 
                to="/" 
                className={cn(
                  "flex items-center space-x-1",
                  location.pathname === "/" ? "text-primary font-medium" : "text-muted-foreground"
                )}
              >
                <Home className="h-4 w-4" />
                <span>Home</span>
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link 
                to="/settings" 
                className={cn(
                  "flex items-center space-x-1",
                  location.pathname === "/settings" ? "text-primary font-medium" : "text-muted-foreground"
                )}
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Link>
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-2 text-primary border-primary hover:bg-primary/10 group"
              asChild
            >
              <Link 
                to="/donate"
                onClick={handleDonateClick}
                className="flex items-center space-x-1"
              >
                <Heart className="h-4 w-4 group-hover:text-primary fill-primary/20 group-hover:fill-primary/40 transition-all" />
                <span>Donate</span>
              </Link>
            </Button>
            
            <div className="ml-2">
              {isLoading ? (
                <Button variant="ghost" size="sm" disabled>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  <span>Loading...</span>
                </Button>
              ) : (
                <AuthButton />
              )}
            </div>
          </nav>
          
          <div className="flex items-center md:hidden space-x-2">
            <Button 
              variant="outline" 
              size="icon" 
              className="text-primary border-primary hover:bg-primary/10 group"
              asChild
            >
              <Link 
                to="/donate"
                onClick={handleDonateClick}
              >
                <Heart className="h-4 w-4 group-hover:text-primary fill-primary/20 group-hover:fill-primary/40 transition-all" />
              </Link>
            </Button>
            
            {isLoading ? (
              <Button variant="ghost" size="icon" disabled>
                <Loader2 className="h-4 w-4 animate-spin" />
              </Button>
            ) : (
              <AuthButton />
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
        
        {isMenuOpen && (
          <nav className="pt-4 pb-2 md:hidden">
            <div className="flex flex-col space-y-2">
              <Link 
                to="/" 
                className={cn(
                  "flex items-center space-x-2 rounded-md px-3 py-2 transition-colors",
                  location.pathname === "/" 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:bg-accent"
                )}
              >
                <Home className="h-4 w-4" />
                <span>Home</span>
              </Link>
              <Link 
                to="/settings" 
                className={cn(
                  "flex items-center space-x-2 rounded-md px-3 py-2 transition-colors",
                  location.pathname === "/settings" 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:bg-accent"
                )}
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Link>
              <Link 
                to="/donate" 
                className={cn(
                  "flex items-center space-x-2 rounded-md px-3 py-2 transition-colors",
                  location.pathname === "/donate" 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:bg-accent"
                )}
              >
                <Heart className="h-4 w-4" />
                <span>Donate</span>
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Navbar;
