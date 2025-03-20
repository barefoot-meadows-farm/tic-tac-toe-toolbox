
import { Music } from 'lucide-react';

const SoundSettings = () => {
  return (
    <div className="border rounded-lg p-4">
      <div className="mb-4">
        <div className="flex items-center mb-1">
          <Music className="mr-2 h-4 w-4" />
          <h3 className="text-lg font-medium">Sound</h3>
        </div>
        <p className="text-sm text-muted-foreground">Configure basic sound settings for the game.</p>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-medium">Enable Sound Effects</span>
            <p className="text-xs text-muted-foreground">Play sounds for game interactions like placing marks and winning.</p>
          </div>
          <input type="checkbox" className="h-4 w-4" defaultChecked />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <span className="font-medium">Enable Background Music</span>
            <p className="text-xs text-muted-foreground">Play ambient music while using the application.</p>
          </div>
          <input type="checkbox" className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
};

export default SoundSettings;
