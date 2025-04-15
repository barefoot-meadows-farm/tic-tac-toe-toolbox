
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { GameVariant } from '@/utils/games';
import { Gamepad, User, Bot, Grid3X3, Trophy } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import StandardGameSettings from './StandardGameSettings';

interface GameStartProps {
  game: GameVariant;
  initialSettings?: GameSettings;
  onStart: (settings: GameSettings) => void;
  onCancel: () => void;
}

export interface GameSettings {
  opponent: 'ai' | 'human';
  difficulty: 'easy' | 'medium' | 'hard';
  boardSize: number;
  winLength: number;
  timeLimit: number | null;
  firstPlayer: 'player1' | 'player2' | 'random';
  customRules: Record<string, any>;
}

const GameStart: React.FC<GameStartProps> = ({ game, initialSettings, onStart, onCancel }) => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<GameSettings>(initialSettings || {
    opponent: 'ai',
    difficulty: 'medium',
    boardSize: 3,
    winLength: 3,
    timeLimit: null,
    firstPlayer: 'random',
    customRules: {}
  });
  
  // Custom rules per game
  const gameSpecificSettings = () => {
    switch (game.id) {
      case 'misere':
        return (
          <div className="mb-6 bg-muted/40 p-3 rounded-md">
            <p className="text-sm text-accent-foreground font-medium mb-2">Misère Mode</p>
            <p className="text-xs text-muted-foreground">In this variant, the player who makes three in a row loses the game.</p>
          </div>
        );
        
      case 'chaos':
        return (
          <div className="mb-6 bg-muted/40 p-3 rounded-md">
            <p className="text-sm text-accent-foreground font-medium mb-2">Chaos Mode</p>
            <p className="text-xs text-muted-foreground">After both players have completed their turns, two random tiles on the board swap positions. This can dramatically change the game state!</p>
          </div>
        );
        
      case 'feral':
        return (
          <div className="mb-6 bg-muted/40 p-3 rounded-md">
            <p className="text-sm text-accent-foreground font-medium mb-2">Feral Mode</p>
            <p className="text-xs text-muted-foreground">Players can overwrite an opponent's placement with their own mark.</p>
          </div>
        );
        
      case 'numerical':
        // Determine number pools based on selected target sum
        const oddNumbers = settings.customRules.targetSum === 34 ? 
          "1, 3, 5, 7, 9, 11, 13, 15" : 
          "1, 3, 5, 7, 9";
        const evenNumbers = settings.customRules.targetSum === 34 ? 
          "2, 4, 6, 8, 10, 12, 14, 16" : 
          "2, 4, 6, 8";
          
        return (
          <div className="mb-6 bg-muted/40 p-3 rounded-md">
            <p className="text-sm text-accent-foreground font-medium mb-2">Numerical Mode</p>
            <p className="text-xs text-muted-foreground">
              Player 1 uses odd numbers ({oddNumbers}) and Player 2 uses even numbers ({evenNumbers}). 
              Win by getting three numbers that sum to {settings.customRules.targetSum || 15}.
            </p>
          </div>
        );
        
      default:
        return null;
    }
  };

  const handleSettingsChanged = (newSettings: GameSettings) => {
    setSettings(newSettings);
  };

  const handleStartGame = () => {
    // Validate settings
    if (settings.boardSize < 3) {
      toast({
        title: "Invalid settings",
        description: "Board size must be at least 3x3.",
        variant: "destructive"
      });
      return;
    }
    
    if (settings.winLength > settings.boardSize) {
      toast({
        title: "Invalid settings",
        description: "Win length cannot be greater than board size.",
        variant: "destructive"
      });
      return;
    }
    
    onStart(settings);
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-sm p-6 max-w-md mx-auto animate-fade-in">
      <h2 className="text-2xl font-bold mb-6 text-center">Game Settings: {game.name}</h2>
      
      {gameSpecificSettings()}
      
      <div className="space-y-6">
        <StandardGameSettings 
          gameId={game.id}
          onSettingsChanged={handleSettingsChanged}
          isMinimal={false}
          initialSettings={settings}
        />
      </div>
      
      <div className="mt-8 flex justify-between gap-4">
        <Button
          variant="outline"
          onClick={onCancel}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          onClick={handleStartGame}
          className="flex-1"
        >
          Start Game
        </Button>
      </div>
    </div>
  );
};

export default GameStart;
