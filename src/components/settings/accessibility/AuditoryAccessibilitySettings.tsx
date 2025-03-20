
import { Ear } from 'lucide-react';
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

const AuditoryAccessibilitySettings = () => {
  return (
    <AccordionItem value="auditory-accessibility">
      <AccordionTrigger className="text-lg font-medium">
        <div className="flex items-center">
          <Ear className="mr-2 h-4 w-4" />
          Auditory Accessibility
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pt-2">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">Screen Reader Support</span>
            <input type="checkbox" className="h-4 w-4" defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <span className="font-medium">Audio Cues for Game Events</span>
            <input type="checkbox" className="h-4 w-4" defaultChecked />
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default AuditoryAccessibilitySettings;
