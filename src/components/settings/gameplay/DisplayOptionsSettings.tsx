
import { Monitor } from 'lucide-react';
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

const DisplayOptionsSettings = () => {
  return (
    <AccordionItem value="display-options">
      <AccordionTrigger className="text-lg font-medium">
        <div className="flex items-center">
          <Monitor className="mr-2 h-4 w-4" />
          Display Options
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pt-2">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">Show Move History</span>
            <input type="checkbox" className="h-4 w-4" />
          </div>
          
          <div className="flex items-center justify-between">
            <span className="font-medium">Show Coordinates</span>
            <input type="checkbox" className="h-4 w-4" />
          </div>
          
          <div className="flex items-center justify-between">
            <span className="font-medium">Highlight Winning Line</span>
            <input type="checkbox" className="h-4 w-4" defaultChecked />
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default DisplayOptionsSettings;
