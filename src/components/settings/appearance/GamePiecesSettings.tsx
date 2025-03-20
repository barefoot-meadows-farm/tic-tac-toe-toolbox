
import { SquareUser } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

const GamePiecesSettings = () => {
  return (
    <AccordionItem value="game-pieces">
      <AccordionTrigger className="text-lg font-medium">
        <div className="flex items-center">
          <SquareUser className="mr-2 h-4 w-4" />
          Game Pieces
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pt-2">
        <div className="space-y-4">
          <div className="grid gap-2">
            <span className="font-medium">X Style</span>
            <div className="flex space-x-2">
              <Button variant="default" size="sm">X</Button>
              <Button variant="outline" size="sm">×</Button>
              <Button variant="outline" size="sm">✕</Button>
              <Button variant="outline" size="sm">❌</Button>
            </div>
          </div>
          
          <div className="grid gap-2">
            <span className="font-medium">O Style</span>
            <div className="flex space-x-2">
              <Button variant="default" size="sm">O</Button>
              <Button variant="outline" size="sm">○</Button>
              <Button variant="outline" size="sm">◯</Button>
              <Button variant="outline" size="sm">⭕</Button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="font-medium">X Color</span>
              <input 
                type="color" 
                className="w-full h-10 mt-2 rounded-md border border-input" 
                defaultValue="#ef4444" 
              />
            </div>
            <div>
              <span className="font-medium">O Color</span>
              <input 
                type="color" 
                className="w-full h-10 mt-2 rounded-md border border-input" 
                defaultValue="#3b82f6" 
              />
            </div>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default GamePiecesSettings;
