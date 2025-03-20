
import { VolumeX } from 'lucide-react';
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

const SoundOptionsSettings = () => {
  return (
    <AccordionItem value="sound-options">
      <AccordionTrigger className="text-lg font-medium">
        <div className="flex items-center">
          <VolumeX className="mr-2 h-4 w-4" />
          Sound Options
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pt-2">
        <div className="space-y-4">
          <div className="grid gap-2">
            <span className="font-medium">Sound Theme</span>
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
            <span className="font-medium">Mute When Tab is Inactive</span>
            <input type="checkbox" className="h-4 w-4" defaultChecked />
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default SoundOptionsSettings;
