
import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Lock } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TicTacToeGame from '@/components/TicTacToeGame';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getGameById } from '@/utils/games';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const GameDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const game = getGameById(id || '');
  const [showPremiumDialog, setShowPremiumDialog] = useState(false);
  
  useEffect(() => {
    if (!id || !game) {
      navigate('/collection');
    } else if (game.premium) {
      setShowPremiumDialog(true);
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
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl md:text-4xl font-bold">{game.name}</h1>
                  {game.premium && (
                    <Badge className="bg-primary/90 text-primary-foreground flex items-center">
                      <Lock className="h-3 w-3 mr-1" />
                      Premium
                    </Badge>
                  )}
                </div>
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
                  {game.id === 'traditional' ? (
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
                  ) : game.id === 'sos' ? (
                    <>
                      The SOS variant changes the pieces from X's and O's to S's and O's. Each turn, the player's
                      piece alternates, adding a unique rhythm to the game and changing the winning patterns.
                    </>
                  ) : game.id === 'feral' ? (
                    <>
                      Feral Tic-Tac-Toe introduces the ability to overwrite an opponent's placement with your own,
                      meaning no placement is permanent and requiring players to think even more strategically.
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
                {game.premium ? (
                  <div className="p-8 text-center">
                    <Lock className="h-12 w-12 mx-auto mb-4 text-primary/70" />
                    <h3 className="text-xl font-bold mb-2">Premium Game</h3>
                    <p className="text-muted-foreground mb-6">
                      This game variant is only available to premium subscribers.
                    </p>
                    <Button 
                      onClick={() => setShowPremiumDialog(true)}
                      className="w-full max-w-xs mx-auto"
                    >
                      Unlock Premium
                    </Button>
                  </div>
                ) : (
                  <TicTacToeGame variant={game.id} />
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Dialog open={showPremiumDialog} onOpenChange={setShowPremiumDialog}>
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
      
      <Footer />
    </div>
  );
};

export default GameDetails;
