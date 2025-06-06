
import React, { useState, useEffect } from 'react';
import { SquareUser, Type } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTheme } from '@/contexts/ThemeContext';

const GamePiecesSettings: React.FC = () => {
  const { 
    animationSpeed, 
    setAnimationSpeed, 
    player1Symbol, 
    setPlayer1Symbol, 
    player2Symbol, 
    setPlayer2Symbol,
    setQuickSymbols
  } = useTheme();
  
  const [tempPlayer1, setTempPlayer1] = useState(player1Symbol);
  const [tempPlayer2, setTempPlayer2] = useState(player2Symbol);
  
  // Update local state when context props change
  useEffect(() => {
    setTempPlayer1(player1Symbol);
    setTempPlayer2(player2Symbol);
  }, [player1Symbol, player2Symbol]);
  
  const handleSpeedChange = (value: number[]) => {
    if (value[0] !== animationSpeed) {
      setAnimationSpeed(value[0]);
    }
  };
  
  const handleSymbol1Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempPlayer1(e.target.value);
  };
  
  const handleSymbol2Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempPlayer2(e.target.value);
  };
  
  const handleSymbol1Blur = () => {
    if (tempPlayer1 !== player1Symbol) {
      if (tempPlayer1.trim() === '') {
        setTempPlayer1('X');
        setPlayer1Symbol('X');
      } else {
        setPlayer1Symbol(tempPlayer1);
      }
    }
  };
  
  const handleSymbol2Blur = () => {
    if (tempPlayer2 !== player2Symbol) {
      if (tempPlayer2.trim() === '') {
        setTempPlayer2('O');
        setPlayer2Symbol('O');
      } else {
        setPlayer2Symbol(tempPlayer2);
      }
    }
  };
  
  const handleQuickSymbolSelect = (symbolSet: [string, string]) => {
    if (symbolSet[0] !== player1Symbol || symbolSet[1] !== player2Symbol) {
      setQuickSymbols(symbolSet);
    }
  };
  
  const quickSymbolSets: [string, string][] = [
    ['X', 'O'],
    ['♠', '♥'],
    ['⭐', '⚡'],
    ['🔴', '🔵'],
    ['🐱', '🐶'],
    ['1', '0']
  ];

  const getSpeedLabel = (speed: number) => {
    if (speed < 25) return 'Slow';
    if (speed < 75) return 'Medium';
    return 'Fast';
  };

  return (
    <div className="border rounded-lg p-4">
      <div className="mb-4">
        <div className="flex items-center mb-1">
          <SquareUser className="mr-2 h-4 w-4" />
          <h3 className="text-lg font-medium">Game Pieces</h3>
        </div>
        <p className="text-sm text-muted-foreground">Customize the appearance of game pieces.</p>
      </div>
      
      <div className="space-y-4">
        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <span className="font-medium">Animation Speed</span>
            <span className="text-xs">{getSpeedLabel(animationSpeed)}</span>
          </div>
          <p className="text-xs text-muted-foreground">Adjust the speed of gameplay animations.</p>
          <Slider 
            value={[animationSpeed]} 
            max={100} 
            step={1} 
            onValueChange={handleSpeedChange}
          />
        </div>
        
        <div className="grid gap-2">
          <span className="font-medium">Custom Symbols</span>
          <p className="text-xs text-muted-foreground">Replace default X and O with custom symbols.</p>
          
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div>
              <label htmlFor="player1-symbol" className="text-xs font-medium">Player 1 Symbol</label>
              <Input 
                id="player1-symbol"
                placeholder="X"
                maxLength={2}
                className="mt-1"
                value={tempPlayer1}
                onChange={handleSymbol1Change}
                onBlur={handleSymbol1Blur}
              />
            </div>
            <div>
              <label htmlFor="player2-symbol" className="text-xs font-medium">Player 2 Symbol</label>
              <Input 
                id="player2-symbol"
                placeholder="O"
                maxLength={2}
                className="mt-1"
                value={tempPlayer2}
                onChange={handleSymbol2Change}
                onBlur={handleSymbol2Blur}
              />
            </div>
          </div>
          
          <div className="mt-2">
            <label className="text-xs font-medium">Quick Select</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {quickSymbolSets.map((symbolSet, index) => (
                <Button 
                  key={index}
                  variant={player1Symbol === symbolSet[0] && player2Symbol === symbolSet[1] ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleQuickSymbolSelect(symbolSet)}
                  type="button"
                >
                  {symbolSet[0]}/{symbolSet[1]}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamePiecesSettings;
