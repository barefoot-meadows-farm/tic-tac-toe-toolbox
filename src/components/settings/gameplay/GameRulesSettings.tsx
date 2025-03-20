
import { Dice1 } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
        
        <div className="space-y-2">
          <span className="font-medium">First Player</span>
          <p className="text-xs text-muted-foreground">Determines which symbol starts the game by default.</p>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">X</Button>
            <Button variant="outline" size="sm">Random</Button>
            <Button variant="outline" size="sm">O</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameRulesSettings;
