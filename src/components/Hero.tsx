
import { ArrowRight } from 'lucide-react';

const Hero = () => {
  return (
    <div className="relative overflow-hidden pt-20 pb-6 md:pt-28 md:pb-10 bg-gradient-to-br from-primary/10 to-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center text-center">
          <div className="animate-fade-in [animation-delay:200ms]">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
              <span className="text-primary">Tic Tac</span> 
              <span className="font-light">Toolbox</span>
              <span className="block text-xl md:text-2xl font-medium text-muted-foreground mt-4">
                Classic games reimagined
              </span>
            </h1>
          </div>
          
          <div className="max-w-2xl mx-auto animate-fade-in [animation-delay:400ms]">
            <p className="text-lg md:text-xl text-foreground/80 mb-6">
              Explore beautiful, modern variations of the classic Tic Tac Toe game.
              Challenge yourself with new rules and gameplay mechanics.
            </p>
          </div>
          
          {/* Feature badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 max-w-3xl mx-auto animate-fade-in [animation-delay:800ms]">
            <div className="bg-background/60 backdrop-blur-sm p-4 rounded-lg border border-border/40 shadow-sm">
              <p className="font-medium">9+ Game Variants</p>
            </div>
            <div className="bg-background/60 backdrop-blur-sm p-4 rounded-lg border border-border/40 shadow-sm">
              <p className="font-medium">Custom Rules</p>
            </div>
            <div className="bg-background/60 backdrop-blur-sm p-4 rounded-lg border border-border/40 shadow-sm">
              <p className="font-medium">Modern UI</p>
            </div>
            <div className="bg-background/60 backdrop-blur-sm p-4 rounded-lg border border-border/40 shadow-sm">
              <p className="font-medium">Customizable</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Background decorative elements */}
      <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[800px] h-[800px] opacity-5 rounded-full bg-primary animate-pulse-slow -z-10" />
      <div className="absolute top-1/3 right-0 w-64 h-64 bg-accent/20 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10" />
    </div>
  );
};

export default Hero;
