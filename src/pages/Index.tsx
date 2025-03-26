
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Hero from '@/components/Hero';
import GameCard from '@/components/GameCard';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getFeaturedGames } from '@/utils/games';
import TicTacToeGame from '@/components/TicTacToeGame';

const Index = () => {
  const featuredGames = getFeaturedGames();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main>
        <Hero />
        
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12 animate-fade-in [animation-delay:300ms]">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Play the Classic</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                The timeless game of X's and O's with beautiful animations.
              </p>
            </div>
            
            <div className="animate-scale-in [animation-delay:500ms]">
              <TicTacToeGame className="mb-8" />
              
              <div className="flex justify-center mt-8">
                <Button asChild variant="outline">
                  <Link to="/collection" className="flex items-center">
                    More Games
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
        
        <section className="py-16 md:py-20 bg-muted/30">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Variants</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Discover unique twists on the classic game
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {featuredGames.slice(0, 3).map((game, index) => (
                <div key={game.id} className="animate-fade-in" style={{ animationDelay: `${300 + (index * 100)}ms` }}>
                  <GameCard game={game} featured />
                </div>
              ))}
            </div>
            
            <div className="flex justify-center mt-12">
              <Button asChild variant="default" size="lg" className="group">
                <Link to="/collection">
                  View All Games
                  <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
