
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  // Stripe payment link - replace this with your actual Stripe hosted checkout URL
  const stripePaymentLink = "https://buy.stripe.com/test_bIYcODbOF8Rx0Za5kk";
  
  const handleDonateClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // You can add analytics tracking here if needed
    console.log('Donate button clicked');
    // The href attribute will handle the redirect
  };
  
  return (
    <footer className="mt-auto py-8 border-t border-border/50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <Link to="/" className="text-xl font-bold tracking-tight flex items-center">
              <span className="mr-1 text-primary">Tic</span>
              <span className="mr-1">Tac</span>
              <span className="text-primary">Toolbox</span>
            </Link>
            <p className="text-sm text-muted-foreground mt-2">
              A collection of Tic-Tac-Toe variants
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row items-center md:space-x-8">
            <Link 
              to="/" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors my-1 md:my-0"
            >
              Home
            </Link>
            <Link 
              to="/collection" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors my-1 md:my-0"
            >
              Collection
            </Link>
            <Link 
              to="/settings" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors my-1 md:my-0"
            >
              Settings
            </Link>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="my-2 md:my-0 text-primary border-primary hover:bg-primary/10 group"
              asChild
            >
              <a 
                href={stripePaymentLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleDonateClick}
                className="flex items-center space-x-1"
              >
                <Heart className="h-4 w-4 group-hover:text-primary fill-primary/20 group-hover:fill-primary/40 transition-all" />
                <span>Donate</span>
              </a>
            </Button>
          </div>
          
          <div className="mt-4 md:mt-0 text-sm text-muted-foreground">
            &copy; {currentYear} Tic Tac Toolbox
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
