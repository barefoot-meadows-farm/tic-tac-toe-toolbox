
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { GameVariant } from '@/utils/games';
import { Gamepad, User, Bot, Grid3X3, Trophy } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

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

  // Determine if the game has customizable board size
  // Unrestricted mode should not have customizable board size
  const hasCustomBoardSize = false;
  
  // Determine if the game has customizable win length
  const hasCustomWinLength = game.id === 'unrestricted'; // Only Unrestricted mode has customizable win length
  
  // Determine max board size based on game
  const maxBoardSize = 9;
  
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
        return (
          <div className="mb-6 bg-muted/40 p-3 rounded-md">
            <p className="text-sm text-accent-foreground font-medium mb-2">Numerical Mode</p>
            <p className="text-xs text-muted-foreground">Player 1 uses odd numbers (1,3,5,7,9) and Player 2 uses even numbers (2,4,6,8). Win by getting three numbers that sum to 15.</p>
          </div>
        );
        

        
      default:
        return null;
    }
  };

  const handleStartGame = () => {
    // Validate settings
    if (hasCustomBoardSize && settings.boardSize < 3) {
      toast({
        title: "Invalid settings",
        description: "Board size must be at least 3x3.",
        variant: "destructive"
      });
      return;
    }
    
    if (hasCustomWinLength && settings.winLength > settings.boardSize) {
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
        <div>
          <h3 className="flex items-center text-lg font-medium mb-3">
            <Gamepad className="w-5 h-5 mr-2" />
            Opponent
          </h3>
          <RadioGroup 
            defaultValue={settings.opponent}
            onValueChange={(value: 'ai' | 'human') => 
              setSettings(prev => ({ ...prev, opponent: value }))
            }
            className="grid grid-cols-2 gap-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="ai" id="ai" />
              <Label htmlFor="ai" className="flex items-center cursor-pointer">
                <Bot className="w-4 h-4 mr-1" /> AI
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="human" id="human" />
              <Label htmlFor="human" className="flex items-center cursor-pointer">
                <User className="w-4 h-4 mr-1" /> Human
              </Label>
            </div>
          </RadioGroup>
        </div>
        
        {settings.opponent === 'ai' && (
          <div>
            <h3 className="text-sm font-medium mb-2">AI Difficulty</h3>
            <RadioGroup 
              defaultValue={settings.difficulty}
              onValueChange={(value: 'easy' | 'medium' | 'hard') => 
                setSettings(prev => ({ ...prev, difficulty: value }))
              }
              className="grid grid-cols-3 gap-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="easy" id="easy" />
                <Label htmlFor="easy" className="cursor-pointer">Easy</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="medium" id="medium" />
                <Label htmlFor="medium" className="cursor-pointer">Medium</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="hard" id="hard" />
                <Label htmlFor="hard" className="cursor-pointer">Hard</Label>
              </div>
            </RadioGroup>
          </div>
        )}
        
        <div>
          <h3 className="flex items-center text-sm font-medium mb-2">
            <Trophy className="w-4 h-4 mr-1" />
            First Player
          </h3>
          <RadioGroup 
            defaultValue={settings.firstPlayer}
            onValueChange={(value: 'player1' | 'player2' | 'random') => 
              setSettings(prev => ({ ...prev, firstPlayer: value }))
            }
            className="grid grid-cols-3 gap-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="player1" id="player1" />
              <Label htmlFor="player1" className="cursor-pointer">
                Player 1
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="player2" id="player2" />
              <Label htmlFor="player2" className="cursor-pointer">
                Player 2
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="random" id="random" />
              <Label htmlFor="random" className="cursor-pointer">
                Random
              </Label>
            </div>
          </RadioGroup>
        </div>
        
        {hasCustomBoardSize && (
          <div>
            <h3 className="flex items-center text-sm font-medium mb-2">
              <Grid3X3 className="w-4 h-4 mr-1" />
              Board Size: {settings.boardSize}x{settings.boardSize}
            </h3>
            <Slider
              defaultValue={[3]}
              max={maxBoardSize}
              min={3}
              step={1}
              onValueChange={(value) => setSettings(prev => ({
                ...prev, 
                boardSize: value[0],
                // Ensure win length is not greater than board size
                winLength: prev.winLength > value[0] ? value[0] : prev.winLength
              }))}
            />
          </div>
        )}
        
        {hasCustomWinLength && (
          <div>
            <h3 className="flex items-center text-sm font-medium mb-2">
              Win Length: {settings.winLength}
            </h3>
            <Slider
              defaultValue={[3]}
              max={settings.boardSize}
              min={3}
              step={1}
              onValueChange={(value) => setSettings(prev => ({
                ...prev, 
                winLength: value[0]
              }))}
            />
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Time Limit</span>
          <Switch 
            checked={settings.timeLimit !== null}
            onCheckedChange={(checked) => 
              setSettings(prev => ({ 
                ...prev, 
                timeLimit: checked ? 30 : null 
              }))
            }
          />
        </div>
        
        {settings.timeLimit !== null && (
          <div>
            <h3 className="text-sm font-medium mb-2">
              Time Per Move: {settings.timeLimit} seconds
            </h3>
            <Slider
              defaultValue={[30]}
              max={60}
              min={5}
              step={5}
              onValueChange={(value) => setSettings(prev => ({
                ...prev, 
                timeLimit: value[0]
              }))}
            />
          </div>
        )}
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
