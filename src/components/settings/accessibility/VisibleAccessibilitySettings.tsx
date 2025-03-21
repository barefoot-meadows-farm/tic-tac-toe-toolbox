
import { Monitor, Eye, ZoomIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';

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
          <Switch id="high-contrast" />
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
          <Switch id="reduce-animations" />
        </div>
        
        <div>
          <div className="flex items-center mb-1">
            <Eye className="mr-2 h-4 w-4" />
            <span className="font-medium">Colorblind Modes</span>
          </div>
          <p className="text-xs text-muted-foreground mb-2">Optimize colors for different types of color vision deficiency.</p>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm">None</Button>
            <Button variant="outline" size="sm">Protanopia</Button>
            <Button variant="outline" size="sm">Deuteranopia</Button>
            <Button variant="outline" size="sm">Tritanopia</Button>
          </div>
        </div>
        
        <div>
          <div className="flex items-center mb-1">
            <ZoomIn className="mr-2 h-4 w-4" />
            <span className="font-medium">Zoom Controls</span>
          </div>
          <p className="text-xs text-muted-foreground">Adjust the zoom level of the game board.</p>
          <div className="flex items-center justify-between mt-2">
            <Button variant="outline" size="icon" className="h-8 w-8">-</Button>
            <span className="text-sm">100%</span>
            <Button variant="outline" size="icon" className="h-8 w-8">+</Button>
          </div>
          <Slider defaultValue={[100]} min={50} max={200} step={10} className="mt-2" />
        </div>
      </div>
    </div>
  );
};

export default VisibleAccessibilitySettings;
