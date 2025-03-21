
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import GameCard from '@/components/GameCard';
import { gameVariants } from '@/utils/games';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Unlock } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type Difficulty = 'all' | 'easy' | 'medium' | 'hard';
type GameType = 'all' | 'free' | 'premium';

const Collection = () => {
  const [difficulty, setDifficulty] = useState<Difficulty>('all');
  const [gameType, setGameType] = useState<GameType>('all');
  
  const filterGames = () => {
    let filtered = [...gameVariants];
    
    // Filter by difficulty
    if (difficulty !== 'all') {
      filtered = filtered.filter(game => game.difficulty === difficulty);
    }
    
    // Filter by game type (free/premium)
    if (gameType === 'free') {
      filtered = filtered.filter(game => !game.premium);
    } else if (gameType === 'premium') {
      filtered = filtered.filter(game => game.premium);
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
                Explore our complete collection of Tic-Tac-Toe variants, 
                each offering a unique twist on the classic game.
              </p>
            </div>
            
            <div className="flex justify-center mb-10 animate-fade-in [animation-delay:200ms]">
              <div className="flex flex-wrap gap-2 justify-center">
                <div className="flex flex-wrap gap-2 justify-center mr-4">
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
                
                <div className="flex flex-wrap gap-2 justify-center">
                  {(['all', 'free', 'premium'] as const).map((type) => (
                    <Button
                      key={type}
                      variant={gameType === type ? "default" : "outline"}
                      size="sm"
                      onClick={() => setGameType(type)}
                      className="capitalize"
                    >
                      {type === 'all' ? 'All Games' : type === 'free' ? 'Free Games' : 'Premium Games'}
                      {type === 'premium' && <Lock className="ml-2 h-3 w-3" />}
                      {type === 'free' && <Unlock className="ml-2 h-3 w-3" />}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {filteredGames.map((game, index) => (
                <div key={game.id} className="animate-fade-in" style={{ animationDelay: `${300 + (index * 100)}ms` }}>
                  {game.premium ? (
                    <PremiumGameCard game={game} />
                  ) : (
                    <GameCard game={game} />
                  )}
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

interface PremiumGameCardProps {
  game: typeof gameVariants[0];
}

const PremiumGameCard: React.FC<PremiumGameCardProps> = ({ game }) => {
  const difficultyColor = {
    easy: 'bg-green-500/10 text-green-500 hover:bg-green-500/20',
    medium: 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20',
    hard: 'bg-red-500/10 text-red-500 hover:bg-red-500/20',
  };

  return (
    <GameCard 
      game={game} 
      className="relative overflow-hidden"
      renderFooter={() => (
        <div className="p-6 mt-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full flex items-center justify-center space-x-2"
              >
                <Lock className="h-4 w-4" />
                <span>Unlock Premium Game</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Unlock Premium Games</DialogTitle>
                <DialogDescription>
                  Upgrade to Tic Tac Toolbox Premium to access all premium game variants, including {game.name}.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <div className="rounded-lg bg-muted/50 p-4 mb-4">
                  <h3 className="font-semibold mb-2">Premium features include:</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Access to all premium game variants</li>
                    <li>Ad-free experience</li>
                    <li>Custom themes and board designs</li>
                    <li>Early access to new game modes</li>
                  </ul>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" className="w-full sm:w-auto">Subscribe Monthly - $2.99</Button>
                <Button className="w-full sm:w-auto">Subscribe Yearly - $24.99</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}
    >
      <div className="absolute top-0 right-0 bg-primary/90 text-primary-foreground px-3 py-1 text-xs font-semibold flex items-center rounded-bl-lg">
        <Lock className="h-3 w-3 mr-1" />
        Premium
      </div>
    </GameCard>
  );
};

export default Collection;
