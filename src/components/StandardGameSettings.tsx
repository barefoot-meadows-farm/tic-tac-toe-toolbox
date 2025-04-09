
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Gamepad, User, Bot, Grid3X3, Trophy, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface StandardGameSettingsProps {
  gameId: string;
  onSettingsChanged?: (settings: GameSettings) => void;
  isMinimal?: boolean;
  initialSettings?: GameSettings;
}

const StandardGameSettings: React.FC<StandardGameSettingsProps> = ({ 
  gameId, 
  onSettingsChanged,
  isMinimal = false,
  initialSettings
}) => {
  const { toast } = useToast();
  const { getGameSettings, applyGameSettings, defaultGameSettings } = useGameSettings();
  
  // Get game-specific settings or use defaults
  const storedSettings = getGameSettings(gameId);
  const [settings, setSettings] = useState<GameSettings>(initialSettings || storedSettings || defaultGameSettings);
  const [isOpen, setIsOpen] = useState(false);

  // Determine if this game mode should have customizable board size
  // Unrestricted mode doesn't use board size setting
  const hasCustomBoardSize = gameId !== 'unrestricted';
  
  // Determine if this game mode should have customizable win length
  // Numerical mode doesn't use win length setting
  const hasCustomWinLength = gameId !== 'numerical';
  
  // Board size options as per requirements
  const boardSizeOptions = [3, 4, 5];
  
  // Time limit options in seconds as per requirements
  const timeLimitOptions = [
    { value: 10, label: '10 seconds' },
    { value: 15, label: '15 seconds' },
    { value: 30, label: '30 seconds' },
    { value: 60, label: '1 minute' },
    { value: 120, label: '2 minutes' },
    { value: 300, label: '5 minutes' },
  ];

  // Get available win length options based on board size and game mode
  const getWinLengthOptions = (boardSize: number) => {
    const options = [];
    
    // For Unrestricted mode, allow win length values from 3 to 10 regardless of board size
    if (gameId === 'unrestricted') {
      for (let i = 3; i <= 10; i++) {
        options.push(i);
      }
    } else {
      // For other game modes, win length can't exceed board size
      for (let i = 3; i <= boardSize; i++) {
        options.push(i);
      }
    }
    
    return options;
  };

  const handleSettingsChange = (newSettings: Partial<GameSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    
    // If board size changes, ensure win length is valid
    if (newSettings.boardSize && updatedSettings.winLength > newSettings.boardSize) {
      updatedSettings.winLength = newSettings.boardSize;
    }
    
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
            Board Size
          </h3>
          <Select
            value={settings.boardSize.toString()}
            onValueChange={(value) => {
              const newBoardSize = parseInt(value);
              handleSettingsChange({
                boardSize: newBoardSize,
                // Ensure win length is not greater than board size
                winLength: settings.winLength > newBoardSize ? newBoardSize : settings.winLength
              });
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select board size">{settings.boardSize}x{settings.boardSize}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {boardSizeOptions.map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size}x{size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      
      {hasCustomWinLength && (
        <div>
          <h3 className="flex items-center text-sm font-medium mb-2">
            Win Length
          </h3>
          <Select
            value={settings.winLength.toString()}
            onValueChange={(value) => {
              handleSettingsChange({
                winLength: parseInt(value)
              });
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select win length">{settings.winLength}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {getWinLengthOptions(settings.boardSize).map((length) => (
                <SelectItem key={length} value={length.toString()}>
                  {length}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
            Time Per Move
          </h3>
          <Select
            value={settings.timeLimit.toString()}
            onValueChange={(value) => {
              handleSettingsChange({
                timeLimit: parseInt(value)
              });
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select time limit" />
            </SelectTrigger>
            <SelectContent>
              {timeLimitOptions.map((option) => (
                <SelectItem key={option.value} value={option.value.toString()}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
