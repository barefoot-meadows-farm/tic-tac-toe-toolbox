
import { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TicTacToeGame from '@/components/TicTacToeGame';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getGameById } from '@/utils/games';
import { cn } from '@/lib/utils';

const GameDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const game = getGameById(id || '');
  
  useEffect(() => {
    if (!id || !game) {
      navigate('/collection');
    }
  }, [id, game, navigate]);
  
  if (!game) {
    return null;
  }
  
  const difficultyColor = {
    easy: 'bg-green-500/10 text-green-500 hover:bg-green-500/20',
    medium: 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20',
    hard: 'bg-red-500/10 text-red-500 hover:bg-red-500/20',
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24">
        <div className="container mx-auto px-4 md:px-6 py-12 md:py-16">
          <div className="mb-6 animate-fade-in">
            <Button asChild variant="ghost" size="sm" className="group mb-4">
              <Link to="/collection">
                <ArrowLeft className="mr-2 w-4 h-4 transition-transform group-hover:-translate-x-1" />
                Back to Collection
              </Link>
            </Button>
            
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">{game.name}</h1>
                <p className="text-lg text-muted-foreground mt-2">{game.description}</p>
              </div>
              <Badge 
                variant="outline" 
                className={cn(
                  "transition-colors text-base px-3 py-1",
                  difficultyColor[game.difficulty]
                )}
              >
                {game.difficulty}
              </Badge>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div className="animate-fade-in [animation-delay:200ms] order-2 lg:order-1 pb-6">
              <div className="bg-muted/30 rounded-lg p-6 shadow-sm mb-8">
                <h2 className="text-xl font-bold mb-4">Rules</h2>
                <ul className="space-y-3">
                  {game.rules.map((rule, index) => (
                    <li key={index} className="flex gap-3">
                      <span className="text-primary font-bold">{index + 1}.</span>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="mt-8">
                <h2 className="text-xl font-bold mb-4">About This Variant</h2>
                <p className="text-foreground/80">
                  {game.id === 'classic' ? (
                    <>
                      The classic Tic-Tac-Toe game has been played for centuries. It's a simple yet engaging game
                      that helps develop strategic thinking and pattern recognition.
                    </>
                  ) : game.id === 'ultimate' ? (
                    <>
                      Ultimate Tic-Tac-Toe adds a layer of strategy to the classic game by turning it into a 
                      game of nested boards. This variant requires deeper thinking and planning several moves ahead.
                    </>
                  ) : game.id === 'misere' ? (
                    <>
                      Misère Tic-Tac-Toe flips the objective, creating an interesting twist where players must
                      avoid making three in a row. This reversal changes the entire strategy of the game.
                    </>
                  ) : (
                    <>
                      This unique variant of Tic-Tac-Toe offers a fresh perspective on the classic game,
                      challenging players to think differently and develop new strategies.
                    </>
                  )}
                </p>
              </div>
            </div>
            
            <div className="animate-scale-in [animation-delay:400ms] order-1 lg:order-2">
              <div className="bg-background rounded-lg p-6 shadow-md border border-border/50">
                <h2 className="text-xl font-bold mb-6 text-center">Play {game.name}</h2>
                <TicTacToeGame variant={game.id} />
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default GameDetails;
