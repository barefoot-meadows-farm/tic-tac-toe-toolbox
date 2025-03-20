
import { Volume2 } from 'lucide-react';

const VolumeControlSettings = () => {
  return (
    <div className="border rounded-lg p-4">
      <div className="mb-4">
        <div className="flex items-center mb-1">
          <Volume2 className="mr-2 h-4 w-4" />
          <h3 className="text-lg font-medium">Volume Control</h3>
        </div>
        <p className="text-sm text-muted-foreground">Adjust volume levels for different audio elements.</p>
      </div>
      
      <div className="space-y-4">
        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <span className="font-medium">Master Volume</span>
            <span>80%</span>
          </div>
          <p className="text-xs text-muted-foreground">Controls the overall volume of all sounds in the game.</p>
          <input 
            type="range" 
            min="0" 
            max="100" 
            defaultValue="80" 
            className="w-full" 
          />
        </div>
        
        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <span className="font-medium">Sound Effects</span>
            <span>90%</span>
          </div>
          <p className="text-xs text-muted-foreground">Adjusts the volume of gameplay sound effects.</p>
          <input 
            type="range" 
            min="0" 
            max="100" 
            defaultValue="90" 
            className="w-full" 
          />
        </div>
        
        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <span className="font-medium">Background Music</span>
            <span>60%</span>
          </div>
          <p className="text-xs text-muted-foreground">Controls the volume of background music.</p>
          <input 
            type="range" 
            min="0" 
            max="100" 
            defaultValue="60" 
            className="w-full" 
          />
        </div>
      </div>
    </div>
  );
};

export default VolumeControlSettings;
