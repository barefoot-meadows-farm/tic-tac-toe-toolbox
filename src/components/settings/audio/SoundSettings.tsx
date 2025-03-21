
import { Music, FileMusic } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

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
          <Switch id="sound-effects" defaultChecked />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <span className="font-medium">Enable Background Music</span>
            <p className="text-xs text-muted-foreground">Play ambient music while using the application.</p>
          </div>
          <Switch id="background-music" />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <span className="font-medium">Allow Personal Music</span>
            <p className="text-xs text-muted-foreground">Play your own music files during gameplay.</p>
          </div>
          <Switch id="personal-music" />
        </div>
        
        <div className="grid gap-2 mt-2 hidden" id="personal-music-upload">
          <input type="file" accept="audio/*" className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90 cursor-pointer" />
          <p className="text-xs text-muted-foreground mt-1">Supported formats: MP3, WAV, OGG</p>
        </div>
      </div>
    </div>
  );
};

export default SoundSettings;
