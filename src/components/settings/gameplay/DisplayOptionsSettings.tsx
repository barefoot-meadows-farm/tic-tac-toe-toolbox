
import { Monitor } from 'lucide-react';

const DisplayOptionsSettings = () => {
  return (
    <div className="border rounded-lg p-4">
      <div className="mb-4">
        <div className="flex items-center mb-1">
          <Monitor className="mr-2 h-4 w-4" />
          <h3 className="text-lg font-medium">Display Options</h3>
        </div>
        <p className="text-sm text-muted-foreground">Customize what information is shown during gameplay.</p>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-medium">Show Move History</span>
            <p className="text-xs text-muted-foreground">Displays a record of moves made during the game.</p>
          </div>
          <input type="checkbox" className="h-4 w-4" />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <span className="font-medium">Show Coordinates</span>
            <p className="text-xs text-muted-foreground">Shows position coordinates on the game board.</p>
          </div>
          <input type="checkbox" className="h-4 w-4" />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <span className="font-medium">Highlight Winning Line</span>
            <p className="text-xs text-muted-foreground">Visually emphasizes the winning combination of moves.</p>
          </div>
          <input type="checkbox" className="h-4 w-4" defaultChecked />
        </div>
      </div>
    </div>
  );
};

export default DisplayOptionsSettings;
