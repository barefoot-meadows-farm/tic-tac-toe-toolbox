
import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { getGameById } from '@/utils/games';
import { useGameSettings } from '@/contexts/GameSettingsContext';
import GameStart, { GameSettings } from '@/components/GameStart';
import TicTacToeGame from '@/components/TicTacToeGame';
import { useAuth } from '@/contexts/AuthContext';

const GamePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getGameSettings, applyGameSettings, defaultGameSettings } = useGameSettings();
  const [settings, setSettings] = useState<GameSettings | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const { isPremium } = useAuth();
  
  const game = getGameById(id || '');
  
  useEffect(() => {
    if (!id || !game) {
      navigate('/collection');
      return;
    }
    
    // Redirect to collection if the game is premium and user doesn't have premium access
    if (game.premium && !isPremium) {
      navigate('/collection');
      return;
    }
    
    // Check if there are settings saved for this game
    const savedSettings = getGameSettings(id);
    if (savedSettings) {
      setSettings(savedSettings);
    } else {
      setSettings(defaultGameSettings);
      setShowSettings(true);
    }
  }, [id, game, navigate, getGameSettings, defaultGameSettings, isPremium]);
  
  const handleSettingsApplied = (newSettings: GameSettings) => {
    setSettings(newSettings);
    setShowSettings(false);
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
      <div className="flex items-center justify-between mb-6">
        <Button asChild variant="ghost" size="sm" className="group">
          <Link to="/collection">
            <ArrowLeft className="mr-2 w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Back to Games
          </Link>
        </Button>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setShowSettings(true)}
        >
          Game Settings
        </Button>
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
                  navigate('/collection');
                }
              }}
            />
          </div>
        ) : (
          <TicTacToeGame 
            variant={id || 'traditional'} 
            settings={settings}
            isFullscreen={true}
          />
        )}
      </div>
    </div>
  );
};

export default GamePage;
