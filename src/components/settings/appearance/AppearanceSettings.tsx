
import React from 'react';
import { Palette } from 'lucide-react';
import ThemeSettings from './ThemeSettings';
import GameBoardSettings from './GameBoardSettings';
import GamePiecesSettings from './GamePiecesSettings';

const AppearanceSettings: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Palette className="h-5 w-5" />
        <h2 className="text-2xl font-semibold">Appearance</h2>
      </div>
      
      <div className="space-y-4">
        <ThemeSettings />
        <GameBoardSettings />
        <GamePiecesSettings />
      </div>
    </div>
  );
};

export default AppearanceSettings;
