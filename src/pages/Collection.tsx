
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import GameCard from '@/components/GameCard';
import { gameVariants, getFreeGames } from '@/utils/games';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Info, Gamepad } from 'lucide-react';
import { cn } from '@/lib/utils';

type Difficulty = 'all' | 'easy' | 'medium' | 'hard';

const Collection = () => {
  const [difficulty, setDifficulty] = useState<Difficulty>('all');
  
  const filterGames = () => {
    // Only get free games
    let filtered = getFreeGames();
    
    if (difficulty !== 'all') {
      filtered = filtered.filter(game => game.difficulty === difficulty);
    }
    
    return filtered;
  };
  
  const filteredGames = filterGames();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24">
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12 animate-fade-in">
              <h1 className="text-3xl md:text-5xl font-bold mb-4">Game Collection</h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Explore our collection of free Tic-Tac-Toe variants, 
                each offering a unique twist on the classic game.
              </p>
            </div>
            
            <div className="flex justify-center mb-10 animate-fade-in [animation-delay:200ms]">
              <div className="flex flex-wrap gap-2 justify-center">
                <div className="flex flex-wrap gap-2 justify-center">
                  {(['all', 'easy', 'medium', 'hard'] as const).map((diff) => (
                    <Button
                      key={diff}
                      variant={difficulty === diff ? "default" : "outline"}
                      size="sm"
                      onClick={() => setDifficulty(diff)}
                      className={cn(
                        "capitalize",
                        difficulty === diff && diff === 'easy' && "bg-green-500 hover:bg-green-600",
                        difficulty === diff && diff === 'medium' && "bg-yellow-500 hover:bg-yellow-600",
                        difficulty === diff && diff === 'hard' && "bg-red-500 hover:bg-red-600"
                      )}
                    >
                      {diff === 'all' ? 'All Difficulties' : diff}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {filteredGames.map((game, index) => (
                <div key={game.id} className="animate-fade-in" style={{ animationDelay: `${300 + (index * 100)}ms` }}>
                  <GameCard 
                    game={game} 
                    renderFooter={() => (
                      <div className="flex gap-2 mt-4">
                        <Button asChild variant="outline" className="flex-1 gap-1">
                          <Link to={`/game/${game.id}`}>
                            <Info className="h-4 w-4" />
                            <span>Details</span>
                          </Link>
                        </Button>
                        <Button asChild className="flex-1 gap-1">
                          <Link to={`/play/${game.id}`}>
                            <Gamepad className="h-4 w-4" />
                            <span>Play</span>
                          </Link>
                        </Button>
                      </div>
                    )}
                  />
                </div>
              ))}
              
              {filteredGames.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <p className="text-lg text-muted-foreground">
                    No games found with the selected filters.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Collection;
