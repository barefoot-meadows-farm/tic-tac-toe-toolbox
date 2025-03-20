
import { Grid3X3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

const GameBoardSettings = () => {
  return (
    <AccordionItem value="game-board">
      <AccordionTrigger className="text-lg font-medium">
        <div className="flex items-center">
          <Grid3X3 className="mr-2 h-4 w-4" />
          Game Board
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pt-2">
        <div className="space-y-4">
          <div className="grid gap-2">
            <span className="font-medium">Board Size</span>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">Small</Button>
              <Button variant="default" size="sm">Medium</Button>
              <Button variant="outline" size="sm">Large</Button>
            </div>
          </div>
          
          <div className="grid gap-2">
            <span className="font-medium">Board Style</span>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">Classic</Button>
              <Button variant="outline" size="sm">Minimal</Button>
              <Button variant="default" size="sm">Modern</Button>
            </div>
          </div>
          
          <div className="grid gap-2">
            <span className="font-medium">Board Color</span>
            <input 
              type="color" 
              className="w-full h-10 rounded-md border border-input" 
              defaultValue="#f3f4f6" 
            />
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default GameBoardSettings;
