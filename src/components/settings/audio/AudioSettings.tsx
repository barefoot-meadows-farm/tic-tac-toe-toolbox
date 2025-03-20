
import { Volume2 } from 'lucide-react';
import { Accordion } from "@/components/ui/accordion";
import SoundSettings from './SoundSettings';
import VolumeControlSettings from './VolumeControlSettings';
import SoundOptionsSettings from './SoundOptionsSettings';

const AudioSettings = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Volume2 className="h-5 w-5" />
        <h2 className="text-2xl font-semibold">Audio</h2>
      </div>
      
      <Accordion type="single" collapsible className="w-full">
        <SoundSettings />
        <VolumeControlSettings />
        <SoundOptionsSettings />
      </Accordion>
    </div>
  );
};

export default AudioSettings;
