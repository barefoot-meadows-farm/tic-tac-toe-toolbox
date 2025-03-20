
import { LayoutGrid } from 'lucide-react';
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

const MotorAccessibilitySettings = () => {
  return (
    <AccordionItem value="motor-accessibility">
      <AccordionTrigger className="text-lg font-medium">
        <div className="flex items-center">
          <LayoutGrid className="mr-2 h-4 w-4" />
          Motor Accessibility
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pt-2">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">Keyboard Navigation</span>
            <input type="checkbox" className="h-4 w-4" defaultChecked />
          </div>
          
          <div className="grid gap-2">
            <span className="font-medium">Input Method</span>
            <select 
              className="w-full p-2 rounded-md border border-input bg-background"
            >
              <option value="touch">Touch/Mouse</option>
              <option value="keyboard">Keyboard Only</option>
              <option value="both">Both</option>
            </select>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default MotorAccessibilitySettings;
