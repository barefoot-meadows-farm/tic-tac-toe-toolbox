
import { Volume2 } from 'lucide-react';
import SoundSettings from './SoundSettings';
import VolumeControlSettings from './VolumeControlSettings';
import SoundOptionsSettings from './SoundOptionsSettings';
import AdvancedSoundSettings from './AdvancedSoundSettings';

const AudioSettings = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Volume2 className="h-5 w-5" />
        <h2 className="text-2xl font-semibold">Audio</h2>
      </div>
      
      <div className="space-y-4">
        <SoundSettings />
        <VolumeControlSettings />
        <AdvancedSoundSettings />
        <SoundOptionsSettings />
      </div>
    </div>
  );
};

export default AudioSettings;
