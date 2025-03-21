
import { Volume2, MousePointerClick, Timer } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';

const AdvancedSoundSettings = () => {
  return (
    <div className="border rounded-lg p-4">
      <div className="mb-4">
        <div className="flex items-center mb-1">
          <Volume2 className="mr-2 h-4 w-4" />
          <h3 className="text-lg font-medium">Advanced Sound Settings</h3>
        </div>
        <p className="text-sm text-muted-foreground">Configure detailed sound options for different game events.</p>
      </div>
      
      <div className="space-y-4">
        <div>
          <span className="font-medium">Individual Sound Toggles</span>
          <p className="text-xs text-muted-foreground mb-2">Enable or disable specific game sounds.</p>
          
          <div className="space-y-2 ml-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Piece Placement</span>
              <Switch id="sound-placement" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Victory Sounds</span>
              <Switch id="sound-victory" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Draw Game Sounds</span>
              <Switch id="sound-draw" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Menu Navigation</span>
              <Switch id="sound-menu" defaultChecked />
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center">
              <MousePointerClick className="mr-2 h-4 w-4" />
              <span className="font-medium">Click Feedback</span>
            </div>
            <p className="text-xs text-muted-foreground">Play a sound when clicking or tapping on the game board.</p>
          </div>
          <Switch id="click-feedback" defaultChecked />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center">
              <Timer className="mr-2 h-4 w-4" />
              <span className="font-medium">Countdown Sounds</span>
            </div>
            <p className="text-xs text-muted-foreground">Play ticking sounds during timed moves.</p>
          </div>
          <Switch id="countdown-sounds" />
        </div>
        
        <div className="grid gap-2">
          <span className="text-sm font-medium">Countdown Volume</span>
          <Slider defaultValue={[50]} max={100} step={1} />
        </div>
      </div>
    </div>
  );
};

export default AdvancedSoundSettings;
