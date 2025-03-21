
import { SquareUser, Type } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const GamePiecesSettings = () => {
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
            <span className="text-xs">Fast</span>
          </div>
          <p className="text-xs text-muted-foreground">Adjust the speed of gameplay animations.</p>
          <Slider defaultValue={[75]} max={100} step={1} />
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
              />
            </div>
            <div>
              <label htmlFor="player2-symbol" className="text-xs font-medium">Player 2 Symbol</label>
              <Input 
                id="player2-symbol"
                placeholder="O"
                maxLength={2}
                className="mt-1"
              />
            </div>
          </div>
          
          <div className="mt-2">
            <label className="text-xs font-medium">Quick Select</label>
            <div className="flex flex-wrap gap-2 mt-1">
              <Button variant="outline" size="sm">X/O</Button>
              <Button variant="outline" size="sm">♠/♥</Button>
              <Button variant="outline" size="sm">⭐/⚡</Button>
              <Button variant="outline" size="sm">🔴/🔵</Button>
              <Button variant="outline" size="sm">🐱/🐶</Button>
              <Button variant="outline" size="sm">1/0</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamePiecesSettings;
