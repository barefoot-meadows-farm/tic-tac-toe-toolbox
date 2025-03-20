
import { LayoutGrid } from 'lucide-react';

const MotorAccessibilitySettings = () => {
  return (
    <div className="border rounded-lg p-4">
      <div className="mb-4">
        <div className="flex items-center mb-1">
          <LayoutGrid className="mr-2 h-4 w-4" />
          <h3 className="text-lg font-medium">Motor Accessibility</h3>
        </div>
        <p className="text-sm text-muted-foreground">Customize input methods for users with limited mobility.</p>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-medium">Keyboard Navigation</span>
            <p className="text-xs text-muted-foreground">Navigate and play using keyboard shortcuts instead of mouse/touch.</p>
          </div>
          <input type="checkbox" className="h-4 w-4" defaultChecked />
        </div>
        
        <div className="grid gap-2">
          <span className="font-medium">Input Method</span>
          <p className="text-xs text-muted-foreground">Select your preferred way to interact with the game.</p>
          <select 
            className="w-full p-2 rounded-md border border-input bg-background"
          >
            <option value="touch">Touch/Mouse</option>
            <option value="keyboard">Keyboard Only</option>
            <option value="both">Both</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default MotorAccessibilitySettings;
