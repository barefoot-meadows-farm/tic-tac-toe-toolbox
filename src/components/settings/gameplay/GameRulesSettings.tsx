
import { Dice1, Check, Play } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

const GameRulesSettings = () => {
  return (
    <div className="border rounded-lg p-4">
      <div className="mb-4">
        <div className="flex items-center mb-1">
          <Dice1 className="mr-2 h-4 w-4" />
          <h3 className="text-lg font-medium">Game Rules</h3>
        </div>
        <p className="text-sm text-muted-foreground">Configure basic game rules and difficulty settings.</p>
      </div>
      
      <div className="space-y-4">
        <div className="grid gap-2">
          <label htmlFor="difficulty" className="font-medium">Default Difficulty</label>
          <p className="text-xs text-muted-foreground">Sets the AI opponent difficulty level for single player games.</p>
          <select 
            id="difficulty"
            className="w-full p-2 rounded-md border border-input bg-background"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <span className="font-medium">Move Confirmation</span>
            <p className="text-xs text-muted-foreground">Require confirmation before finalizing each move.</p>
          </div>
          <Switch id="move-confirmation" />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <span className="font-medium">Auto-start Next Game</span>
            <p className="text-xs text-muted-foreground">Automatically start a new game after current game ends.</p>
          </div>
          <Switch id="auto-start" />
        </div>
      </div>
    </div>
  );
};

export default GameRulesSettings;
