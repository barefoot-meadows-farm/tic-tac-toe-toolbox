
import { Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

const VisibleAccessibilitySettings = () => {
  return (
    <AccordionItem value="visible-accessibility">
      <AccordionTrigger className="text-lg font-medium">
        <div className="flex items-center">
          <Monitor className="mr-2 h-4 w-4" />
          Visible Accessibility
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pt-2">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">High Contrast Mode</span>
            <input type="checkbox" className="h-4 w-4" />
          </div>
          
          <div className="grid gap-2">
            <span className="font-medium">Text Size</span>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">Small</Button>
              <Button variant="default" size="sm">Medium</Button>
              <Button variant="outline" size="sm">Large</Button>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="font-medium">Reduce Animations</span>
            <input type="checkbox" className="h-4 w-4" />
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default VisibleAccessibilitySettings;
