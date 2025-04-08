
import { Switch } from "@/components/ui/switch";
import { Dice1 } from "lucide-react";
import { useState, useEffect } from "react";
import { useGameSettings } from "@/contexts/GameSettingsContext";
import UnrestrictedGameSettings from "./UnrestrictedGameSettings";

const GameRulesSettings = () => {
  const { gameSettings, applyGameSettings } = useGameSettings();
  const [selectedGameMode, setSelectedGameMode] = useState<string>("traditional");
  const [unrestrictedSettings, setUnrestrictedSettings] = useState({
    winLength: 3,
    moveLimit: null as number | null
  });

  // Apply unrestricted settings when they change
  useEffect(() => {
    if (selectedGameMode === "unrestricted") {
      const currentSettings = gameSettings["unrestricted"] || {};
      applyGameSettings("unrestricted", {
        ...currentSettings,
        customRules: {
          ...currentSettings.customRules,
          winLength: unrestrictedSettings.winLength,
          moveLimit: unrestrictedSettings.moveLimit
        }
      });
    }
  }, [unrestrictedSettings, selectedGameMode]);

  const handleGameModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedGameMode(e.target.value);
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
            <option value="unrestricted">Unrestricted</option>
          </select>
        </div>

        {selectedGameMode === "unrestricted" && (
          <div className="mt-4 pt-4 border-t">
            <h4 className="text-sm font-medium mb-3">Unrestricted Mode Settings</h4>
            <UnrestrictedGameSettings 
              initialSettings={unrestrictedSettings}
              onSettingsChange={setUnrestrictedSettings}
            />
          </div>
        )}
        
        <div className="grid gap-2">
          <label htmlFor="difficulty" className="font-medium">Default Difficulty</label>
          <p className="text-xs text-muted-foreground">Sets the AI opponent difficulty level for single player games.</p>
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
