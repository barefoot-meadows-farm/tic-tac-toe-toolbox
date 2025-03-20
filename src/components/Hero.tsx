
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const Hero = () => {
  return (
    <div className="relative overflow-hidden pt-24 pb-12 md:pt-32 md:pb-20">
      <div className="absolute inset-0 bg-gradient-to-br from-accent/50 to-background -z-10" />
      
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center text-center">
          <div className="animate-fade-in [animation-delay:200ms]">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              <span className="text-primary">Tic</span>
              <span className="mx-1">Tac</span>
              <span className="text-primary">Toe</span>
              <span className="block text-2xl md:text-3xl font-medium text-muted-foreground mt-2">Collection</span>
            </h1>
          </div>
          
          <div className="max-w-2xl mx-auto animate-fade-in [animation-delay:400ms]">
            <p className="text-lg md:text-xl text-foreground/80 mb-8">
              Explore beautiful, minimalist variations of the classic game, 
              reimagined with elegant design and smooth interactions.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 animate-fade-in [animation-delay:600ms]">
            <Button asChild size="lg" className="group">
              <Link to="/collection">
                Explore Collection
                <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
      
      <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[800px] h-[800px] opacity-10 rounded-full bg-primary animate-pulse-slow -z-10" />
    </div>
  );
};

export default Hero;
