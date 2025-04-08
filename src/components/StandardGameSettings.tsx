
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { GameVariant } from '@/utils/games';
import { Gamepad, User, Bot, Grid3X3, Trophy, Clock } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { GameSettings } from './GameStart';
import { useGameSettings } from '@/contexts/GameSettingsContext';
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger, 
} from '@/components/ui/sheet';

interface StandardGameSettingsProps {
  gameId: string;
  onSettingsChanged?: (settings: GameSettings) => void;
  isMinimal?: boolean;
}

const StandardGameSettings: React.FC<StandardGameSettingsProps> = ({ 
  gameId, 
  onSettingsChanged,
  isMinimal = false 
}) => {
  const { toast } = useToast();
  const { getGameSettings, applyGameSettings, defaultGameSettings } = useGameSettings();
  
  // Get game-specific settings or use defaults
  const storedSettings = getGameSettings(gameId);
  const [settings, setSettings] = useState<GameSettings>(storedSettings || defaultGameSettings);
  const [isOpen, setIsOpen] = useState(false);

  // Determine if the game has customizable board size
  // Unrestricted mode should not have customizable board size
  const hasCustomBoardSize = false;
  
  // Determine if the game has customizable win length
  const hasCustomWinLength = false; // No games currently have customizable win length
  
  // Determine max board size based on game
  const maxBoardSize = 9;

  const handleSettingsChange = (newSettings: Partial<GameSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    
    if (onSettingsChanged) {
      onSettingsChanged(updatedSettings);
    }
  };

  const handleSaveSettings = () => {
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
    
    // Save settings to context
    applyGameSettings(gameId, settings);
    
    toast({
      title: "Settings saved",
      description: "Your game settings have been updated.",
    });
    
    setIsOpen(false);
  };

  const renderSettingsForm = () => (
    <div className="space-y-6">
      <div>
        <h3 className="flex items-center text-lg font-medium mb-3">
          <Gamepad className="w-5 h-5 mr-2" />
          Opponent
        </h3>
        <RadioGroup 
          value={settings.opponent}
          onValueChange={(value: 'ai' | 'human') => 
            handleSettingsChange({ opponent: value })
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
            value={settings.difficulty}
            onValueChange={(value: 'easy' | 'medium' | 'hard') => 
              handleSettingsChange({ difficulty: value })
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
          value={settings.firstPlayer}
          onValueChange={(value: 'player1' | 'player2' | 'random') => 
            handleSettingsChange({ firstPlayer: value })
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
            value={[settings.boardSize]}
            max={maxBoardSize}
            min={3}
            step={1}
            onValueChange={(value) => handleSettingsChange({
              boardSize: value[0],
              // Ensure win length is not greater than board size
              winLength: settings.winLength > value[0] ? value[0] : settings.winLength
            })}
          />
        </div>
      )}
      
      {hasCustomWinLength && (
        <div>
          <h3 className="flex items-center text-sm font-medium mb-2">
            Win Length: {settings.winLength}
          </h3>
          <Slider
            value={[settings.winLength]}
            max={settings.boardSize}
            min={3}
            step={1}
            onValueChange={(value) => handleSettingsChange({
              winLength: value[0]
            })}
          />
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <span className="flex items-center text-sm font-medium">
          <Clock className="w-4 h-4 mr-1" />
          Time Limit
        </span>
        <Switch 
          checked={settings.timeLimit !== null}
          onCheckedChange={(checked) => 
            handleSettingsChange({ 
              timeLimit: checked ? 30 : null 
            })
          }
        />
      </div>
      
      {settings.timeLimit !== null && (
        <div>
          <h3 className="text-sm font-medium mb-2">
            Time Per Move: {settings.timeLimit} seconds
          </h3>
          <Slider
            value={[settings.timeLimit]}
            max={60}
            min={5}
            step={5}
            onValueChange={(value) => handleSettingsChange({
              timeLimit: value[0]
            })}
          />
        </div>
      )}
    </div>
  );

  // Minimal version just shows a button that opens the settings sheet
  if (isMinimal) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Gamepad className="h-4 w-4" />
            Game Settings
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Game Settings</SheetTitle>
            <SheetDescription>
              Customize your gameplay experience
            </SheetDescription>
          </SheetHeader>
          
          <div className="py-4">
            {renderSettingsForm()}
          </div>
          
          <div className="mt-6 flex justify-end">
            <Button onClick={handleSaveSettings}>
              Save Settings
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // Full version shows all settings inline
  return (
    <div className="bg-card border border-border rounded-lg shadow-sm p-6 max-w-md mx-auto animate-fade-in pointer-events-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">Game Settings</h2>
      
      {renderSettingsForm()}
      
      <div className="mt-8 flex justify-between gap-4">
        <Button
          variant="outline"
          onClick={() => handleSettingsChange(defaultGameSettings)}
          className="flex-1"
        >
          Reset to Defaults
        </Button>
        
        <Button
          onClick={handleSaveSettings}
          className="flex-1"
        >
          Save Settings
        </Button>
      </div>
    </div>
  );
};

export default StandardGameSettings;
