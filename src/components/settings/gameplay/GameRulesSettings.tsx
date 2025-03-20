
import { Dice1 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

const GameRulesSettings = () => {
  return (
    <AccordionItem value="game-rules">
      <AccordionTrigger className="text-lg font-medium">
        <div className="flex items-center">
          <Dice1 className="mr-2 h-4 w-4" />
          Game Rules
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pt-2">
        <div className="space-y-4">
          <div className="grid gap-2">
            <label htmlFor="difficulty" className="font-medium">Default Difficulty</label>
            <select 
              id="difficulty"
              className="w-full p-2 rounded-md border border-input bg-background"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="font-medium">First Player</span>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">X</Button>
              <Button variant="outline" size="sm">Random</Button>
              <Button variant="outline" size="sm">O</Button>
            </div>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default GameRulesSettings;
