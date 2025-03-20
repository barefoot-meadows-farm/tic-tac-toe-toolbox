
import { Gamepad } from 'lucide-react';
import { Accordion } from "@/components/ui/accordion";
import GameRulesSettings from './GameRulesSettings';
import DisplayOptionsSettings from './DisplayOptionsSettings';

const GameplaySettings = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Gamepad className="h-5 w-5" />
        <h2 className="text-2xl font-semibold">Gameplay</h2>
      </div>
      
      <Accordion type="single" collapsible className="w-full">
        <GameRulesSettings />
        <DisplayOptionsSettings />
      </Accordion>
    </div>
  );
};

export default GameplaySettings;
