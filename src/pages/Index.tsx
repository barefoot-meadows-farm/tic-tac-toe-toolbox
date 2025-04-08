
import { Link } from 'react-router-dom';
import { Gamepad2 } from 'lucide-react';
import Hero from '@/components/Hero';
import GameCard from '@/components/GameCard';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { gameVariants } from '@/utils/games';
import Leaderboard from '@/components/Leaderboard';
import PageLayout from '@/components/PageLayout';

const Index = () => {
  // Use all game variants since we've already filtered them in games.tsx
  const filteredGames = gameVariants;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <PageLayout>
        <main>
          <Hero />
          
          <section className="py-12 md:py-16">
            <div className="container mx-auto px-4 md:px-6">
              <div className="text-center mb-8 md:mb-12 animate-fade-in [animation-delay:300ms]">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Leaderboard</h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Track your scores and see how you rank against other players.
                </p>
              </div>
              
              <div className="animate-scale-in [animation-delay:500ms]">
                <Leaderboard className="mb-8" />
              </div>
            </div>
          </section>
          
          <section className="py-16 md:py-20 bg-muted/30">
            <div className="container mx-auto px-4 md:px-6">
              <div className="text-center mb-10">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">All Game Variants</h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Discover unique twists on the classic game - click on any variant to play
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredGames.map((game, index) => (
                  <div key={game.id} className="animate-fade-in" style={{ animationDelay: `${300 + (index * 100)}ms` }}>
                    <GameCard 
                      game={game} 
                      renderFooter={() => (
                        <div className="p-6 mt-4">
                          <Link 
                            to={`/play/${game.id}`}
                            className="flex items-center justify-center w-full bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md text-sm font-medium transition-colors group"
                          >
                            <Gamepad2 className="mr-2 w-4 h-4" />
                            Play {game.name}
                          </Link>
                        </div>
                      )}
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>
      </PageLayout>
      
      <Footer />
    </div>
  );
};

export default Index;
