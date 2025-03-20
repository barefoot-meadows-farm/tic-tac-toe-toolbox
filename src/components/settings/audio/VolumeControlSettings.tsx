
import { Volume2 } from 'lucide-react';
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

const VolumeControlSettings = () => {
  return (
    <AccordionItem value="volume-control">
      <AccordionTrigger className="text-lg font-medium">
        <div className="flex items-center">
          <Volume2 className="mr-2 h-4 w-4" />
          Volume Control
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pt-2">
        <div className="space-y-4">
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <span className="font-medium">Master Volume</span>
              <span>80%</span>
            </div>
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
            <input 
              type="range" 
              min="0" 
              max="100" 
              defaultValue="60" 
              className="w-full" 
            />
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default VolumeControlSettings;
