
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { getGameById } from '@/utils/games';

// Import game components
import TicTacToeConfig from '../../Games/tictactoe';
import MisereTicTacToe from '../../Games/misere';
import NumericalTicTacToe from '../../Games/numerical';
import SOSTicTacToe from '../../Games/sos';
import SOSExtendedTicTacToe from '../../Games/sosextended';
import UltimateTicTacToe from '../../Games/ultimate';
import ThreeDTicTacToe from '../../Games/3D';
import FeralTicTacToe from '../../Games/feral';
import UnrestrictedTicTacToe from '../../Games/unrestricted';

const GamePage = () => {
  const { id } = useParams<{ id: string }>();
  const game = getGameById(id || '');
  
  const renderGame = () => {
    switch(id) {
      case 'traditional':
        return <TicTacToeConfig />;
      case 'misere':
        return <MisereTicTacToe />;
      case 'numerical':
        return <NumericalTicTacToe />;
      case 'sos':
        return <SOSTicTacToe />;
      case 'sos-extended':
        return <SOSExtendedTicTacToe />;
      case 'ultimate':
        return <UltimateTicTacToe />;
      case '3d':
        return <ThreeDTicTacToe />;
      case 'feral':
        return <FeralTicTacToe />;
      case 'unrestricted':
        return <UnrestrictedTicTacToe />;
      default:
        return (
          <div className="text-center py-10">
            <p className="text-lg text-muted-foreground">
              Game component not found for '{id}'
            </p>
            <Button asChild className="mt-4">
              <Link to="/collection">Return to Collection</Link>
            </Button>
          </div>
        );
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24">
        <div className="container mx-auto px-4 py-6">
          <Button asChild variant="ghost" size="sm" className="group mb-6">
            <Link to="/collection">
              <ArrowLeft className="mr-2 w-4 h-4 transition-transform group-hover:-translate-x-1" />
              Back to Collection
            </Link>
          </Button>
          
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold">
              {game?.name || 'Game'}
            </h1>
            {game && (
              <p className="text-muted-foreground mt-2">{game.description}</p>
            )}
          </div>
          
          <div className="flex justify-center">
            {renderGame()}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default GamePage;
