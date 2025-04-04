
import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { getGameById } from '@/utils/games';
import { useGameSettings } from '@/contexts/GameSettingsContext';
import GameStart, { GameSettings } from '@/components/GameStart';
import TicTacToeGame from '@/components/TicTacToeGame';
import { useAuth } from '@/contexts/AuthContext';
import PageLayout from '@/components/PageLayout';
// Fix import path to use relative path instead of alias for Games directory
import NumericalTicTacToe from '../Games/numerical';
import ChaosTicTacToe from '../Games/chaos';

const GamePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getGameSettings, applyGameSettings, defaultGameSettings } = useGameSettings();
  const [settings, setSettings] = useState<GameSettings | null>(null);
  const [showSettings, setShowSettings] = useState(true);
  const { isPremium } = useAuth();
  
  const game = getGameById(id || '');
  
  useEffect(() => {
    if (!id || !game) {
      navigate('/'); // Navigate to home instead of collection
      return;
    }
    
    // Redirect to home if the game is premium and user doesn't have premium access
    if (game.premium && !isPremium) {
      navigate('/');
      return;
    }
    
    // Check if there are settings saved for this game
    const savedSettings = getGameSettings(id);
    if (savedSettings) {
      setSettings(savedSettings);
      // Only show settings if no applied settings exist yet
      // This fixes the loop issue - we don't automatically show settings if they exist
    } else {
      setSettings(defaultGameSettings);
      // Always show settings if none exist yet
      setShowSettings(true);
    }
  }, [id, game, navigate, getGameSettings, defaultGameSettings, isPremium]);
  
  const handleSettingsApplied = (newSettings: GameSettings) => {
    setSettings(newSettings);
    setShowSettings(false); // Hide settings after they're applied
    applyGameSettings(id || '', newSettings);
  };
  
  if (!game || !settings) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-pulse p-8 rounded-md">Loading...</div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col p-4 md:p-8">
      <PageLayout>
        <div className="flex items-center justify-between mb-6">
          <Button asChild variant="ghost" size="sm" className="group">
            <Link to="/">
              <ArrowLeft className="mr-2 w-4 h-4 transition-transform group-hover:-translate-x-1" />
              Back to Home
            </Link>
          </Button>
          
          {!showSettings && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowSettings(true)}
            >
              Game Settings
            </Button>
          )}
        </div>
        
        <div className="flex-grow flex items-center justify-center">
          {showSettings ? (
            <div className="w-full max-w-md mx-auto">
              <GameStart 
                game={game}
                initialSettings={settings}
                onStart={handleSettingsApplied}
                onCancel={() => {
                  if (getGameSettings(id || '')) {
                    setShowSettings(false);
                  } else {
                    navigate('/');
                  }
                }}
              />
            </div>
          ) : (
            // Determine which game component to render based on game id
            id === 'numerical' ? (
              <NumericalTicTacToe 
                settings={settings} 
              />
            ) : id === 'chaos' ? (
              <ChaosTicTacToe 
                settings={settings}
              />
            ) : (
              <TicTacToeGame 
                variant={id || 'traditional'} 
                settings={settings}
                isFullscreen={true}
              />
            )
          )}
        </div>
      </PageLayout>
    </div>
  );
};

export default GamePage;
