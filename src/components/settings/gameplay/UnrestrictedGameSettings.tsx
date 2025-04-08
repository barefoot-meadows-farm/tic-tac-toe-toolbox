import React, { useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Expand, Clock, Flag } from 'lucide-react';

interface UnrestrictedGameSettingsProps {
  onSettingsChange?: (settings: {
    winLength: number;
    moveLimit: number | null;
  }) => void;
  initialSettings?: {
    winLength: number;
    moveLimit: number | null;
  };
}

const UnrestrictedGameSettings: React.FC<UnrestrictedGameSettingsProps> = ({
  onSettingsChange,
  initialSettings = { winLength: 3, moveLimit: null }
}) => {
  const [winLength, setWinLength] = useState(initialSettings.winLength || 3);
  const [enableMoveLimit, setEnableMoveLimit] = useState(initialSettings.moveLimit !== null);
  const [moveLimit, setMoveLimit] = useState(initialSettings.moveLimit || 100);

  const handleWinLengthChange = (value: number[]) => {
    const newWinLength = value[0];
    setWinLength(newWinLength);
    
    if (onSettingsChange) {
      onSettingsChange({
        winLength: newWinLength,
        moveLimit: enableMoveLimit ? moveLimit : null
      });
    }
  };

  const handleMoveLimitToggle = (checked: boolean) => {
    setEnableMoveLimit(checked);
    
    if (onSettingsChange) {
      onSettingsChange({
        winLength,
        moveLimit: checked ? moveLimit : null
      });
    }
  };

  const handleMoveLimitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setMoveLimit(value);
      
      if (onSettingsChange && enableMoveLimit) {
        onSettingsChange({
          winLength,
          moveLimit: value
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="flex items-center text-sm font-medium mb-2">
          <Expand className="w-4 h-4 mr-1" />
          Win Condition: {winLength} in a row
        </h3>
        <p className="text-xs text-muted-foreground mb-2">
          Set how many marks in a row are needed to win (3-10)
        </p>
        <Slider
          value={[winLength]}
          min={3}
          max={10}
          step={1}
          onValueChange={handleWinLengthChange}
        />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <span className="flex items-center text-sm font-medium">
            <Flag className="w-4 h-4 mr-1" />
            Move Limit
          </span>
          <p className="text-xs text-muted-foreground">
            Set a maximum number of moves before the game ends in a draw
          </p>
        </div>
        <Switch 
          checked={enableMoveLimit}
          onCheckedChange={handleMoveLimitToggle}
        />
      </div>

      {enableMoveLimit && (
        <div>
          <h3 className="text-sm font-medium mb-2">
            Maximum Moves: {moveLimit}
          </h3>
          <Input
            type="number"
            min={10}
            max={1000}
            value={moveLimit}
            onChange={handleMoveLimitChange}
            className="w-full"
          />
        </div>
      )}
    </div>
  );
};

export default UnrestrictedGameSettings;