import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Gamepad, User, Bot, Grid3X3, Trophy, Clock, Settings, Shuffle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { GameSettings } from '../GameStart';
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';

interface CustomGameSettingsProps {
  gameId: string;
  onSettingsChanged?: (settings: GameSettings) => void;
  isMinimal?: boolean;
  initialSettings?: GameSettings;
}

interface CustomRules {
  // Board dimensions
  boardSize: number;
  
  // Cell behavior
  allowOverwriting: boolean;
  randomSwaps: boolean;
  swapsPerRound: number;
  
  // Win conditions
  winCondition: 'line' | 'sum';
  winLength: number;
  targetSum: number;
  inversedWinCondition: boolean; // For Misere mode
  
  // Turn mechanics
  turnMechanics: 'standard' | 'modified';
}

const CustomGameSettings: React.FC<CustomGameSettingsProps> = ({
  gameId,
  onSettingsChanged,
  isMinimal = false,
  initialSettings
}) => {
  const { toast } = useToast();
  const { getGameSettings, applyGameSettings, defaultGameSettings } = useGameSettings();
  
  // Get game-specific settings or use defaults
  const storedSettings = getGameSettings(gameId);
  const [settings, setSettings] = useState<GameSettings>(initialSettings || storedSettings || {
    ...defaultGameSettings,
    customRules: {
      // Board dimensions
      boardSize: 3,
      
      // Cell behavior
      allowOverwriting: false, // Feral mode
      randomSwaps: false, // Chaos mode
      swapsPerRound: 1,
      
      // Win conditions
      winCondition: 'line',
      winLength: 3,
      targetSum: 15, // For numerical mode
      inversedWinCondition: false, // Misere mode
      
      // Turn mechanics
      turnMechanics: 'standard',
      
      // Game balance settings
      maxOverwrites: 3, // Limit number of overwrites in Feral mode
      swapCooldown: 2, // Minimum turns between swaps in Chaos mode
      balanceModifier: 1.0 // Adjusts win condition difficulty based on rule combinations
    }
  });
  
  // Track rule conflicts and balance
  const [ruleConflicts, setRuleConflicts] = useState<string[]>([]);
  const [gameBalance, setGameBalance] = useState<number>(1.0); // 1.0 is balanced
  
  const [isOpen, setIsOpen] = useState(false);

  // Board size options
  const boardSizeOptions = [3, 4, 5, 6, 7, 8, 9, 10];
  
  // Time limit options in seconds
  const timeLimitOptions = [
    { value: 10, label: '10 seconds' },
    { value: 15, label: '15 seconds' },
    { value: 30, label: '30 seconds' },
    { value: 60, label: '1 minute' },
    { value: 120, label: '2 minutes' },
    { value: 300, label: '5 minutes' },
  ];

  // Get available win length options based on board size
  const getWinLengthOptions = (boardSize: number) => {
    const options = [];
    
    // Win length can't exceed board size
    for (let i = 3; i <= boardSize; i++) {
      options.push(i);
    }
    
    return options;
  };

  // Target sum options based on board size
  const getTargetSumOptions = (boardSize: number) => {
    if (boardSize === 3) return [15];
    if (boardSize === 4) return [15, 34];
    return [15, 34, 45]; // For larger boards
  };

  const handleSettingsChange = (newSettings: Partial<GameSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    
    // If board size changes, ensure win length is valid
    if (newSettings.customRules?.boardSize && 
        updatedSettings.customRules.winLength > newSettings.customRules.boardSize) {
      updatedSettings.customRules.winLength = newSettings.customRules.boardSize;
    }
    
    setSettings(updatedSettings);
    
    if (onSettingsChanged) {
      onSettingsChanged(updatedSettings);
    }
  };

  const handleCustomRuleChange = (key: keyof CustomRules, value: any) => {
    const updatedRules = { ...settings.customRules, [key]: value };
    
    // Handle interdependent settings
    if (key === 'boardSize') {
      // Ensure win length doesn't exceed board size
      if (updatedRules.winLength > value) {
        updatedRules.winLength = value;
      }
      // Adjust target sum for larger boards
      if (value > 3) {
        updatedRules.targetSum = value === 4 ? 34 : 45;
      }
    }
    
    // If win condition changes, update related settings
    if (key === 'winCondition') {
      if (value === 'sum') {
        // Set appropriate target sum for numerical mode
        updatedRules.targetSum = updatedRules.boardSize > 3 ? 34 : 15;
      }
    }
    
    // Handle rule conflicts and balance
    const conflicts = validateRuleCombination(updatedRules);
    setRuleConflicts(conflicts);
    
    // Calculate game balance based on rule combination
    const balance = calculateGameBalance(updatedRules);
    setGameBalance(balance);
    updatedRules.balanceModifier = balance;
    
    handleSettingsChange({ customRules: updatedRules });
  };
  
  // Validate rule combinations and return any conflicts
  const validateRuleCombination = (rules: CustomRules): string[] => {
    const conflicts: string[] = [];
    
    // Check for potential rule conflicts
    if (rules.allowOverwriting && rules.randomSwaps) {
      conflicts.push('Combining Feral and Chaos modes may lead to unpredictable gameplay');
    }
    
    if (rules.winCondition === 'sum' && rules.randomSwaps) {
      conflicts.push('Random swaps may disrupt numerical win conditions');
    }
    
    if (rules.inversedWinCondition && rules.winCondition === 'sum') {
      conflicts.push('Misere mode with numerical win conditions may be too complex');
    }
    
    return conflicts;
  };
  
  // Calculate game balance based on rule combination
  const calculateGameBalance = (rules: CustomRules): number => {
    let balance = 1.0;
    
    // Adjust balance based on rule combinations
    if (rules.allowOverwriting) balance *= 1.2; // Feral mode makes winning easier
    if (rules.randomSwaps) balance *= 0.8; // Chaos mode makes winning harder
    if (rules.inversedWinCondition) balance *= 0.9; // Misere mode is slightly harder
    if (rules.winCondition === 'sum') balance *= 0.85; // Numerical mode is harder
    
    // Adjust for board size
    balance *= (3 / rules.boardSize); // Larger boards are harder
    
    return Number(balance.toFixed(2));
  }
  };

  const handleSaveSettings = () => {
    // Validate settings
    if (settings.customRules.boardSize < 3 || settings.customRules.boardSize > 10) {
      toast({
        title: "Invalid settings",
        description: "Board size must be between 3x3 and 10x10.",
        variant: "destructive"
      });
      return;
    }
    
    // Save settings
    applyGameSettings(gameId, settings);
    setIsOpen(false);
    
    toast({
      title: "Settings saved",
      description: "Your custom game settings have been saved."
    });
  };

  // Preview of current rule combinations
  const getRulePreview = () => {
    const rules = settings.customRules;
    const descriptions = [];
    
    // Board size
    descriptions.push(`${rules.boardSize}x${rules.boardSize} board`);
    
    // Cell behavior
    if (rules.allowOverwriting) {
      descriptions.push('Overwriting allowed (Feral)');
    }
    if (rules.randomSwaps) {
      descriptions.push(`${rules.swapsPerRound} random swap(s) per round (Chaos)`);
    }
    
    // Win conditions
    if (rules.winCondition === 'line') {
      descriptions.push(`${rules.winLength} in a row`);
      if (rules.inversedWinCondition) {
        descriptions.push('Inverse win condition (Misere)');
      }
    } else {
      descriptions.push(`Sum to ${rules.targetSum} (Numerical)`);
    }
    
    return descriptions.join(' • ');
  };

  // Render the settings UI
  return (
    <div className={`${isMinimal ? '' : 'p-4'}`}>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" className="w-full">
            <Settings className="mr-2 h-4 w-4" />
            Custom Game Settings
          </Button>
        </SheetTrigger>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Custom Game Settings</SheetTitle>
            <SheetDescription>
              Mix and match rules from different game modes to create your own custom experience.
            </SheetDescription>
          </SheetHeader>
          
          <div className="mt-4 space-y-6">
            {/* Current rule combination preview */}
            <div className="bg-muted/40 p-3 rounded-md">
              <p className="text-sm text-accent-foreground font-medium mb-2">Current Rule Combination</p>
              <p className="text-xs text-muted-foreground">{getRulePreview()}</p>
            </div>

            {/* Rule Conflicts Warning */}
            {ruleConflicts.length > 0 && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Rule Combination Notes:</h3>
                <ul className="mt-2 text-sm text-yellow-700 dark:text-yellow-300 list-disc list-inside">
                  {ruleConflicts.map((conflict, index) => (
                    <li key={index}>{conflict}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Game Balance Indicator */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Game Balance</span>
                <span className="text-sm tabular-nums">{(gameBalance * 100).toFixed(0)}%</span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full transition-all",
                    gameBalance < 0.8 ? "bg-red-500" :
                    gameBalance < 1.0 ? "bg-yellow-500" :
                    gameBalance > 1.2 ? "bg-green-500" : "bg-blue-500"
                  )}
                  style={{ width: `${Math.min(gameBalance * 100, 100)}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {gameBalance < 0.8 ? "Very Challenging" :
                 gameBalance < 1.0 ? "Challenging" :
                 gameBalance > 1.2 ? "Easy" : "Balanced"}
              </p>
            </div>
            
            <Accordion type="single" collapsible className="w-full">
              {/* Board Dimensions */}
              <AccordionItem value="board-dimensions">
                <AccordionTrigger className="text-sm font-medium">
                  <Grid3X3 className="mr-2 h-4 w-4" />
                  Board Dimensions
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="boardSize">Board Size ({settings.customRules.boardSize}x{settings.customRules.boardSize})</Label>
                      <Select
                        value={settings.customRules.boardSize.toString()}
                        onValueChange={(value) => handleCustomRuleChange('boardSize', parseInt(value))}
                      >
                        <SelectTrigger id="boardSize">
                          <SelectValue placeholder="Select board size" />
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
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              {/* Cell Behavior */}
              <AccordionItem value="cell-behavior">
                <AccordionTrigger className="text-sm font-medium">
                  <Shuffle className="mr-2 h-4 w-4" />
                  Cell Behavior
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    {/* Overwriting (Feral mode) */}
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="allowOverwriting">Allow Overwriting</Label>
                        <p className="text-xs text-muted-foreground">Players can overwrite opponent's marks (Feral mode)</p>
                      </div>
                      <Switch
                        id="allowOverwriting"
                        checked={settings.customRules.allowOverwriting}
                        onCheckedChange={(checked) => handleCustomRuleChange('allowOverwriting', checked)}
                      />
                    </div>
                    
                    {/* Random Swaps (Chaos mode) */}
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="randomSwaps">Random Swaps</Label>
                        <p className="text-xs text-muted-foreground">Random cells swap after each round (Chaos mode)</p>
                      </div>
                      <Switch
                        id="randomSwaps"
                        checked={settings.customRules.randomSwaps}
                        onCheckedChange={(checked) => handleCustomRuleChange('randomSwaps', checked)}
                      />
                    </div>
                    
                    {/* Swaps per round */}
                    {settings.customRules.randomSwaps && (
                      <div className="space-y-2">
                        <Label htmlFor="swapsPerRound">Swaps Per Round: {settings.customRules.swapsPerRound}</Label>
                        <Slider
                          id="swapsPerRound"
                          min={1}
                          max={3}
                          step={1}
                          value={[settings.customRules.swapsPerRound]}
                          onValueChange={(value) => handleCustomRuleChange('swapsPerRound', value[0])}
                        />
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              {/* Win Conditions */}
              <AccordionItem value="win-conditions">
                <AccordionTrigger className="text-sm font-medium">
                  <Trophy className="mr-2 h-4 w-4" />
                  Win Conditions
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    {/* Win Condition Type */}
                    <div className="space-y-2">
                      <Label>Win Condition Type</Label>
                      <RadioGroup
                        value={settings.customRules.winCondition}
                        onValueChange={(value) => handleCustomRuleChange('winCondition', value)}
                        className="flex flex-col space-y-1"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="line" id="win-line" />
                          <Label htmlFor="win-line">Line Formation (Traditional)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="sum" id="win-sum" />
                          <Label htmlFor="win-sum">Sum Target (Numerical)</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    
                    {/* Line-specific settings */}
                    {settings.customRules.winCondition === 'line' && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="winLength">Win Length</Label>
                          <Select
                            value={settings.customRules.winLength.toString()}
                            onValueChange={(value) => handleCustomRuleChange('winLength', parseInt(value))}
                          >
                            <SelectTrigger id="winLength">
                              <SelectValue placeholder="Select win length" />
                            </SelectTrigger>
                            <SelectContent>
                              {getWinLengthOptions(settings.customRules.boardSize).map((length) => (
                                <SelectItem key={length} value={length.toString()}>
                                  {length} in a row
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        {/* Inverse win condition (Misere) */}
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="inversedWinCondition">Inverse Win Condition</Label>
                            <p className="text-xs text-muted-foreground">Player who forms a line loses (Misere mode)</p>
                          </div>
                          <Switch
                            id="inversedWinCondition"
                            checked={settings.customRules.inversedWinCondition}
                            onCheckedChange={(checked) => handleCustomRuleChange('inversedWinCondition', checked)}
                          />
                        </div>
                      </>
                    )}
                    
                    {/* Sum-specific settings */}
                    {settings.customRules.winCondition === 'sum' && (
                      <div className="space-y-2">
                        <Label htmlFor="targetSum">Target Sum</Label>
                        <Select
                          value={settings.customRules.targetSum.toString()}
                          onValueChange={(value) => handleCustomRuleChange('targetSum', parseInt(value))}
                        >
                          <SelectTrigger id="targetSum">
                            <SelectValue placeholder="Select target sum" />
                          </SelectTrigger>
                          <SelectContent>
                            {getTargetSumOptions(settings.customRules.boardSize).map((sum) => (
                              <SelectItem key={sum} value={sum.toString()}>
                                {sum}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground mt-2">
                          Player 1 uses odd numbers, Player 2 uses even numbers.
                          Win by getting numbers that sum to the target.
                        </p>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              {/* Turn Mechanics */}
              <AccordionItem value="turn-mechanics">
                <AccordionTrigger className="text-sm font-medium">
                  <Gamepad className="mr-2 h-4 w-4" />
                  Turn Mechanics
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Turn Mechanics</Label>
                      <RadioGroup
                        value={settings.customRules.turnMechanics}
                        onValueChange={(value) => handleCustomRuleChange('turnMechanics', value)}
                        className="flex flex-col space-y-1"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="standard" id="turn-standard" />
                          <Label htmlFor="turn-standard">Standard (Alternating turns)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="modified" id="turn-modified" />
                          <Label htmlFor="turn-modified">Modified (Special turn rules)</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              {/* Opponent Settings */}
              <AccordionItem value="opponent">
                <AccordionTrigger className="text-sm font-medium">
                  <User className="mr-2 h-4 w-4" />
                  Opponent
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <RadioGroup
                      value={settings.opponent}
                      onValueChange={(value) => handleSettingsChange({ opponent: value as 'ai' | 'human' })}
                      className="flex flex-col space-y-1"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="ai" id="opponent-ai" />
                        <Label htmlFor="opponent-ai">Play against AI</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="human" id="opponent-human" />
                        <Label htmlFor="opponent-human">Play against human</Label>
                      </div>
                    </RadioGroup>
                    
                    {settings.opponent === 'ai' && (
                      <div className="space-y-2 pt-2">
                        <Label>AI Difficulty</Label>
                        <RadioGroup
                          value={settings.difficulty}
                          onValueChange={(value) => handleSettingsChange({ difficulty: value as 'easy' | 'medium' | 'hard' })}
                          className="flex flex-col space-y-1"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="easy" id="difficulty-easy" />
                            <Label htmlFor="difficulty-easy">Easy</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="medium" id="difficulty-medium" />
                            <Label htmlFor="difficulty-medium">Medium</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="hard" id="difficulty-hard" />
                            <Label htmlFor="difficulty-hard">Hard</Label>
                          </div>
                        </RadioGroup>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              {/* Time Limit */}
              <AccordionItem value="time-limit">
                <AccordionTrigger className="text-sm font-medium">
                  <Clock className="mr-2 h-4 w-4" />
                  Time Limit
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="enable-time-limit">Enable Time Limit</Label>
                      <Switch
                        id="enable-time-limit"
                        checked={settings.timeLimit !== null}
                        onCheckedChange={(checked) => handleSettingsChange({ timeLimit: checked ? 30 : null })}
                      />
                    </div>
                    
                    {settings.timeLimit !== null && (
                      <div className="space-y-2">
                        <Label htmlFor="time-limit">Time Per Move</Label>
                        <Select
                          value={settings.timeLimit.toString()}
                          onValueChange={(value) => handleSettingsChange({ timeLimit: parseInt(value) })}
                        >
                          <SelectTrigger id="time-limit">
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
                </AccordionContent>
              </AccordionItem>
              
              {/* First Player */}
              <AccordionItem value="first-player">
                <AccordionTrigger className="text-sm font-medium">
                  <User className="mr-2 h-4 w-4" />
                  First Player
                </AccordionTrigger>
                <AccordionContent>
                  <RadioGroup
                    value={settings.firstPlayer}
                    onValueChange={(value) => handleSettingsChange({ firstPlayer: value as 'player1' | 'player2' | 'random' })}
                    className="flex flex-col space-y-1"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="player1" id="first-player1" />
                      <Label htmlFor="first-player1">Player 1</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="player2" id="first-player2" />
                      <Label htmlFor="first-player2">Player 2</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="random" id="first-player-random" />
                      <Label htmlFor="first-player-random">Random</Label>
                    </div>
                  </RadioGroup>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveSettings}>Save Settings</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
      
      {/* Preview of current settings */}
      {!isMinimal && (
        <div className="mt-4 bg-muted/40 p-3 rounded-md">
          <p className="text-sm text-accent-foreground font-medium mb-2">Custom Game Mode</p>
          <p className="text-xs text-muted-foreground">{getRulePreview()}</p>
        </div>
      )}
    </div>
  );
};

export default CustomGameSettings;