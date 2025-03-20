
import { SquareUser } from 'lucide-react';
import { Button } from '@/components/ui/button';

const GamePiecesSettings = () => {
  return (
    <div className="border rounded-lg p-4">
      <div className="mb-4">
        <div className="flex items-center mb-1">
          <SquareUser className="mr-2 h-4 w-4" />
          <h3 className="text-lg font-medium">Game Pieces</h3>
        </div>
        <p className="text-sm text-muted-foreground">Customize the appearance of X and O game pieces.</p>
      </div>
      
      <div className="space-y-4">
        <div className="grid gap-2">
          <span className="font-medium">X Style</span>
          <p className="text-xs text-muted-foreground">Choose how the X player's marks appear on the board.</p>
          <div className="flex space-x-2">
            <Button variant="default" size="sm">X</Button>
            <Button variant="outline" size="sm">×</Button>
            <Button variant="outline" size="sm">✕</Button>
            <Button variant="outline" size="sm">❌</Button>
          </div>
        </div>
        
        <div className="grid gap-2">
          <span className="font-medium">O Style</span>
          <p className="text-xs text-muted-foreground">Choose how the O player's marks appear on the board.</p>
          <div className="flex space-x-2">
            <Button variant="default" size="sm">O</Button>
            <Button variant="outline" size="sm">○</Button>
            <Button variant="outline" size="sm">◯</Button>
            <Button variant="outline" size="sm">⭕</Button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="font-medium">X Color</span>
            <p className="text-xs text-muted-foreground">Change the color of X marks.</p>
            <input 
              type="color" 
              className="w-full h-10 mt-2 rounded-md border border-input" 
              defaultValue="#ef4444" 
            />
          </div>
          <div>
            <span className="font-medium">O Color</span>
            <p className="text-xs text-muted-foreground">Change the color of O marks.</p>
            <input 
              type="color" 
              className="w-full h-10 mt-2 rounded-md border border-input" 
              defaultValue="#3b82f6" 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamePiecesSettings;
