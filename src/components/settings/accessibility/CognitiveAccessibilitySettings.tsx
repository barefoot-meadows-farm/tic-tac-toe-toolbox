
import { BrainCircuit } from 'lucide-react';

const CognitiveAccessibilitySettings = () => {
  return (
    <div className="border rounded-lg p-4">
      <div className="mb-4">
        <div className="flex items-center mb-1">
          <BrainCircuit className="mr-2 h-4 w-4" />
          <h3 className="text-lg font-medium">Cognitive Accessibility</h3>
        </div>
        <p className="text-sm text-muted-foreground">Simplify game elements for improved cognitive accessibility.</p>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-medium">Simple Mode</span>
            <p className="text-xs text-muted-foreground">Reduces complexity and visual distractions during gameplay.</p>
          </div>
          <input type="checkbox" className="h-4 w-4" />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <span className="font-medium">Hint System</span>
            <p className="text-xs text-muted-foreground">Provides optional guidance for optimal game moves.</p>
          </div>
          <input type="checkbox" className="h-4 w-4" defaultChecked />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <span className="font-medium">Extended Time Limits</span>
            <p className="text-xs text-muted-foreground">Increases time allowed for making decisions in timed games.</p>
          </div>
          <input type="checkbox" className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
};

export default CognitiveAccessibilitySettings;
