
import { BrainCircuit } from 'lucide-react';
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

const CognitiveAccessibilitySettings = () => {
  return (
    <AccordionItem value="cognitive-accessibility">
      <AccordionTrigger className="text-lg font-medium">
        <div className="flex items-center">
          <BrainCircuit className="mr-2 h-4 w-4" />
          Cognitive Accessibility
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pt-2">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">Simple Mode</span>
            <input type="checkbox" className="h-4 w-4" />
          </div>
          
          <div className="flex items-center justify-between">
            <span className="font-medium">Hint System</span>
            <input type="checkbox" className="h-4 w-4" defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <span className="font-medium">Extended Time Limits</span>
            <input type="checkbox" className="h-4 w-4" />
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default CognitiveAccessibilitySettings;
