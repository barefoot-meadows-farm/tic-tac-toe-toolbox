import React, { useState, useEffect } from 'react';
import { TicTacToeGame } from '@/components/TicTacToeGame';
import CustomGameSettings from '@/components/settings/CustomGameSettings';
import { useGameSettings } from '@/contexts/GameSettingsContext';
import { GameSettings } from '@/components/GameStart';
import { GameVariant } from '@/utils/games';

interface CustomGameProps {
  game: GameVariant;
}

const CustomGame: React.FC<CustomGameProps> = ({ game }) => {
  const { getGameSettings, defaultGameSettings } = useGameSettings();
  const [settings, setSettings] = useState<GameSettings>(
    getGameSettings(game.id) || {
      ...defaultGameSettings,
      customRules: {
        // Default custom rules
        boardSize: 3,
        allowOverwriting: false,
        randomSwaps: false,
        swapsPerRound: 1,
        winCondition: 'line',
        winLength: 3,
        targetSum: 15,
        inversedWinCondition: false,
        turnMechanics: 'standard'
      }
    }
  );

  const handleSettingsChanged = (newSettings: GameSettings) => {
    setSettings(newSettings);
  };

  // Generate a description of the current rule combination
  const getRuleDescription = () => {
    const rules = settings.customRules;
    let description = '';

    // Win condition description
    if (rules.winCondition === 'line') {
      description += `Get ${rules.winLength} in a row`;
      if (rules.inversedWinCondition) {
        description += ' (but forming a line makes you lose)';
      }
    } else {
      description += `Get numbers that sum to ${rules.targetSum}`;
    }

    // Cell behavior description
    if (rules.allowOverwriting) {
      description += ' • You can overwrite opponent\'s marks';
    }
    if (rules.randomSwaps) {
      description += ` • ${rules.swapsPerRound} random swap(s) after each round`;
    }

    return description;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{game.name}</h1>
        <p className="text-muted-foreground">
          {game.description || 'Create your own custom game by mixing rules from different modes.'}
        </p>
        <p className="text-sm mt-2">
          <strong>Current Rules:</strong> {getRuleDescription()}
        </p>
      </div>

      <div className="mb-6">
        <CustomGameSettings 
          gameId={game.id} 
          onSettingsChanged={handleSettingsChanged}
          initialSettings={settings}
        />
      </div>

      <TicTacToeGame 
        gameId={game.id}
        gameMode="custom"
        settings={settings}
      />
    </div>
  );
};

export default CustomGame;