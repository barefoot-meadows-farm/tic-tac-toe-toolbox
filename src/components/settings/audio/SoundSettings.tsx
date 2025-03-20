
import { Music } from 'lucide-react';
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

const SoundSettings = () => {
  return (
    <AccordionItem value="sound">
      <AccordionTrigger className="text-lg font-medium">
        <div className="flex items-center">
          <Music className="mr-2 h-4 w-4" />
          Sound
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pt-2">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">Enable Sound Effects</span>
            <input type="checkbox" className="h-4 w-4" defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <span className="font-medium">Enable Background Music</span>
            <input type="checkbox" className="h-4 w-4" />
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default SoundSettings;
