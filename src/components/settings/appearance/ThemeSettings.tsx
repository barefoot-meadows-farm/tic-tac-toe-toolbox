
import { Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

const ThemeSettings = () => {
  return (
    <AccordionItem value="theme">
      <AccordionTrigger className="text-lg font-medium">
        <div className="flex items-center">
          <Palette className="mr-2 h-4 w-4" />
          Theme
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pt-2">
        <div className="space-y-4">
          <div className="grid gap-2">
            <span className="font-medium">Color Theme</span>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" className="h-8 w-8 p-0 bg-primary"></Button>
              <Button variant="outline" size="sm" className="h-8 w-8 p-0 bg-indigo-500"></Button>
              <Button variant="outline" size="sm" className="h-8 w-8 p-0 bg-blue-500"></Button>
              <Button variant="outline" size="sm" className="h-8 w-8 p-0 bg-green-500"></Button>
              <Button variant="outline" size="sm" className="h-8 w-8 p-0 bg-yellow-500"></Button>
              <Button variant="outline" size="sm" className="h-8 w-8 p-0 bg-red-500"></Button>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="font-medium">Dark Mode</span>
            <input type="checkbox" className="h-4 w-4" />
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default ThemeSettings;
