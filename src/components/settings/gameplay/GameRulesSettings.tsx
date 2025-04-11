
import { Switch } from "@/components/ui/switch";
import { Dice1 } from "lucide-react";
import { useState, useEffect } from "react";
import { useGameSettings } from "@/contexts/GameSettingsContext";
import StandardGameSettings from "@/components/StandardGameSettings";

const GameRulesSettings = () => {
  const { gameSettings, applyGameSettings } = useGameSettings();
  const [selectedGameMode, setSelectedGameMode] = useState<string>("traditional");


  const handleGameModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedGameMode(e.target.value);
  };
  
  const handleSettingsChanged = (newSettings: any) => {
    // This callback will be triggered when settings are changed in StandardGameSettings
    applyGameSettings(selectedGameMode, newSettings);
  };

  return (
    <div className="border rounded-lg p-4">
      <div className="mb-4">
        <div className="flex items-center mb-1">
          <Dice1 className="mr-2 h-4 w-4" />
          <h3 className="text-lg font-medium">Game Rules</h3>
        </div>
        <p className="text-sm text-muted-foreground">Configure basic game rules and difficulty settings.</p>
      </div>
      
      <div className="space-y-4">
        <div className="grid gap-2">
          <label htmlFor="gameMode" className="font-medium">Game Mode</label>
          <p className="text-xs text-muted-foreground">Select the game mode to configure specific settings.</p>
          <select 
            id="gameMode"
            className="w-full p-2 rounded-md border border-input bg-background"
            value={selectedGameMode}
            onChange={handleGameModeChange}
          >
            <option value="traditional">Traditional</option>
            <option value="misere">Misère</option>
            <option value="chaos">Chaos</option>
            <option value="feral">Feral</option>
            <option value="numerical">Numerical</option>
          </select>
        </div>


        
        <div className="mt-4 pt-4 border-t">
          <h4 className="text-sm font-medium mb-3">Universal Game Settings</h4>
          <StandardGameSettings 
            gameId={selectedGameMode} 
            onSettingsChanged={handleSettingsChanged}
          />
        </div>
        
        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <div>
            <span className="font-medium">Move Confirmation</span>
            <p className="text-xs text-muted-foreground">Require confirmation before finalizing each move.</p>
          </div>
          <Switch id="move-confirmation" />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <span className="font-medium">Auto-start Next Game</span>
            <p className="text-xs text-muted-foreground">Automatically start a new game after current game ends.</p>
          </div>
          <Switch id="auto-start" />
        </div>
      </div>
    </div>
  );
};

export default GameRulesSettings;
