
import React from 'react';
import { Grid3X3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

const GameBoardSettings: React.FC = () => {
  const { 
    boardSize, 
    setBoardSize, 
    boardStyle, 
    setBoardStyle, 
    boardColor, 
    setBoardColor 
  } = useTheme();

  const handleBoardSizeChange = (size: 'small' | 'medium' | 'large') => {
    if (size !== boardSize) {
      setBoardSize(size);
    }
  };

  const handleBoardStyleChange = (style: 'classic' | 'minimal' | 'modern') => {
    if (style !== boardStyle) {
      setBoardStyle(style);
    }
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    if (newColor !== boardColor) {
      setBoardColor(newColor);
    }
  };

  return (
    <div className="border rounded-lg p-4">
      <div className="mb-4">
        <div className="flex items-center mb-1">
          <Grid3X3 className="mr-2 h-4 w-4" />
          <h3 className="text-lg font-medium">Game Board</h3>
        </div>
        <p className="text-sm text-muted-foreground">Customize the appearance of the game board.</p>
      </div>
      
      <div className="space-y-4">
        <div className="grid gap-2">
          <span className="font-medium">Board Size</span>
          <p className="text-xs text-muted-foreground">Change the visual size of the game board.</p>
          <div className="flex space-x-2">
            <Button 
              variant={boardSize === "small" ? "default" : "outline"} 
              size="sm"
              onClick={() => handleBoardSizeChange("small")}
              type="button"
            >
              Small
            </Button>
            <Button 
              variant={boardSize === "medium" ? "default" : "outline"} 
              size="sm"
              onClick={() => handleBoardSizeChange("medium")}
              type="button"
            >
              Medium
            </Button>
            <Button 
              variant={boardSize === "large" ? "default" : "outline"} 
              size="sm"
              onClick={() => handleBoardSizeChange("large")}
              type="button"
            >
              Large
            </Button>
          </div>
        </div>
        
        <div className="grid gap-2">
          <span className="font-medium">Board Style</span>
          <p className="text-xs text-muted-foreground">Choose between different board designs.</p>
          <div className="flex space-x-2">
            <Button 
              variant={boardStyle === "classic" ? "default" : "outline"} 
              size="sm"
              onClick={() => handleBoardStyleChange("classic")}
              type="button"
            >
              Classic
            </Button>
            <Button 
              variant={boardStyle === "minimal" ? "default" : "outline"} 
              size="sm"
              onClick={() => handleBoardStyleChange("minimal")}
              type="button"
            >
              Minimal
            </Button>
            <Button 
              variant={boardStyle === "modern" ? "default" : "outline"} 
              size="sm"
              onClick={() => handleBoardStyleChange("modern")}
              type="button"
            >
              Modern
            </Button>
          </div>
        </div>
        
        <div className="grid gap-2">
          <span className="font-medium">Board Color</span>
          <p className="text-xs text-muted-foreground">Change the background color of the game board.</p>
          <input 
            type="color" 
            className="w-full h-10 rounded-md border border-input cursor-pointer" 
            value={boardColor}
            onChange={handleColorChange}
          />
        </div>
      </div>
    </div>
  );
};

export default GameBoardSettings;
