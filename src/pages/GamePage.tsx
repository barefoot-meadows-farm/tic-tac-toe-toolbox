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
import NumericalTicTacToe from '@/Games/numerical';
import UnrestrictedNInARow from '@/Games/unrestricted';
import ChaosTicTacToe from '@/Games/chaos';

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
      navigate('/');
      return;
    }
    
    if (game.premium && !isPremium) {
      navigate('/');
      return;
    }
    
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
            id === 'numerical' ? (
              <NumericalTicTacToe 
                settings={settings} 
              />
            ) : id === 'unrestricted' ? (
              <UnrestrictedNInARow settings={settings} />
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
