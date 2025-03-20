
import { VolumeX } from 'lucide-react';

const SoundOptionsSettings = () => {
  return (
    <div className="border rounded-lg p-4">
      <div className="mb-4">
        <div className="flex items-center mb-1">
          <VolumeX className="mr-2 h-4 w-4" />
          <h3 className="text-lg font-medium">Sound Options</h3>
        </div>
        <p className="text-sm text-muted-foreground">Configure additional sound preferences and behaviors.</p>
      </div>
      
      <div className="space-y-4">
        <div className="grid gap-2">
          <span className="font-medium">Sound Theme</span>
          <p className="text-xs text-muted-foreground">Choose a collection of sounds that match a specific style.</p>
          <select 
            className="w-full p-2 rounded-md border border-input bg-background"
          >
            <option value="classic">Classic</option>
            <option value="modern">Modern</option>
            <option value="retro">Retro</option>
            <option value="minimal">Minimal</option>
          </select>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <span className="font-medium">Mute When Tab is Inactive</span>
            <p className="text-xs text-muted-foreground">Automatically mute sounds when you switch to another browser tab.</p>
          </div>
          <input type="checkbox" className="h-4 w-4" defaultChecked />
        </div>
      </div>
    </div>
  );
};

export default SoundOptionsSettings;
