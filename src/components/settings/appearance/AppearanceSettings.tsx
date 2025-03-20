
import { Palette } from 'lucide-react';
import { Accordion } from "@/components/ui/accordion";
import ThemeSettings from './ThemeSettings';
import GameBoardSettings from './GameBoardSettings';
import GamePiecesSettings from './GamePiecesSettings';

const AppearanceSettings = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Palette className="h-5 w-5" />
        <h2 className="text-2xl font-semibold">Appearance</h2>
      </div>
      
      <Accordion type="single" collapsible className="w-full">
        <ThemeSettings />
        <GameBoardSettings />
        <GamePiecesSettings />
      </Accordion>
    </div>
  );
};

export default AppearanceSettings;
