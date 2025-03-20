
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="mt-auto py-8 border-t border-border/50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <Link to="/" className="text-xl font-bold tracking-tight flex items-center">
              <span className="mr-1 text-primary">Tic</span>
              <span className="mr-1">Tac</span>
              <span className="text-primary">Toe</span>
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
          </div>
          
          <div className="mt-4 md:mt-0 text-sm text-muted-foreground">
            &copy; {currentYear} Tic Tac Toe Collection
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
