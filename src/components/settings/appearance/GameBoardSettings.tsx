
import { Grid3X3 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const GameBoardSettings = () => {
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
            <Button variant="outline" size="sm">Small</Button>
            <Button variant="default" size="sm">Medium</Button>
            <Button variant="outline" size="sm">Large</Button>
          </div>
        </div>
        
        <div className="grid gap-2">
          <span className="font-medium">Board Style</span>
          <p className="text-xs text-muted-foreground">Choose between different board designs.</p>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">Classic</Button>
            <Button variant="outline" size="sm">Minimal</Button>
            <Button variant="default" size="sm">Modern</Button>
          </div>
        </div>
        
        <div className="grid gap-2">
          <span className="font-medium">Board Color</span>
          <p className="text-xs text-muted-foreground">Change the background color of the game board.</p>
          <input 
            type="color" 
            className="w-full h-10 rounded-md border border-input" 
            defaultValue="#f3f4f6" 
          />
        </div>
      </div>
    </div>
  );
};

export default GameBoardSettings;
