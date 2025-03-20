
import { Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';

const VisibleAccessibilitySettings = () => {
  return (
    <div className="border rounded-lg p-4">
      <div className="mb-4">
        <div className="flex items-center mb-1">
          <Monitor className="mr-2 h-4 w-4" />
          <h3 className="text-lg font-medium">Visible Accessibility</h3>
        </div>
        <p className="text-sm text-muted-foreground">Adjust visual settings to improve visibility and readability.</p>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-medium">High Contrast Mode</span>
            <p className="text-xs text-muted-foreground">Increases color contrast to improve visibility.</p>
          </div>
          <input type="checkbox" className="h-4 w-4" />
        </div>
        
        <div className="grid gap-2">
          <span className="font-medium">Text Size</span>
          <p className="text-xs text-muted-foreground">Adjust the size of text throughout the application.</p>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">Small</Button>
            <Button variant="default" size="sm">Medium</Button>
            <Button variant="outline" size="sm">Large</Button>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <span className="font-medium">Reduce Animations</span>
            <p className="text-xs text-muted-foreground">Minimizes movement and visual effects.</p>
          </div>
          <input type="checkbox" className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
};

export default VisibleAccessibilitySettings;
