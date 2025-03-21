
import { BrainCircuit, Type } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';

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
          <Switch id="simple-mode" />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <span className="font-medium">Hint System</span>
            <p className="text-xs text-muted-foreground">Provides optional guidance for optimal game moves.</p>
          </div>
          <Switch id="hint-system" defaultChecked />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <span className="font-medium">Extended Time Limits</span>
            <p className="text-xs text-muted-foreground">Increases time allowed for making decisions in timed games.</p>
          </div>
          <Switch id="extended-time" />
        </div>
        
        <div>
          <div className="flex items-center mb-1">
            <Type className="mr-2 h-4 w-4" />
            <span className="font-medium">Dyslexia Fonts</span>
          </div>
          <p className="text-xs text-muted-foreground mb-2">Use fonts designed to help readers with dyslexia.</p>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm">Default</Button>
            <Button variant="outline" size="sm" className="font-mono">OpenDyslexic</Button>
            <Button variant="outline" size="sm" style={{ fontFamily: "Comic Sans MS" }}>Comic Sans</Button>
            <Button variant="outline" size="sm" className="font-serif">Lexend</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CognitiveAccessibilitySettings;
