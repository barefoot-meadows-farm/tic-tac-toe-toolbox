
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { GameSettings } from '@/components/GameStart';

type GameSettingRecord = Record<string, GameSettings>;

interface GameSettingsContextType {
  gameSettings: GameSettingRecord;
  applyGameSettings: (gameId: string, settings: GameSettings) => void;
  getGameSettings: (gameId: string) => GameSettings | null;
  defaultGameSettings: GameSettings;
}

const defaultSettings: GameSettings = {
  opponent: 'ai',
  difficulty: 'medium',
  boardSize: 3,
  winLength: 3,
  timeLimit: null,
  firstPlayer: 'random',
  customRules: {}
};

const GameSettingsContext = createContext<GameSettingsContextType | undefined>(undefined);

export const GameSettingsProvider = ({ children }: { children: ReactNode }) => {
  const [gameSettings, setGameSettings] = useState<GameSettingRecord>({});

  // Load settings from localStorage on initial render
  useEffect(() => {
    const savedSettings = localStorage.getItem('gameSettings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setGameSettings(parsedSettings);
      } catch (error) {
        console.error('Failed to parse saved game settings:', error);
      }
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (Object.keys(gameSettings).length > 0) {
      localStorage.setItem('gameSettings', JSON.stringify(gameSettings));
    }
  }, [gameSettings]);

  const applyGameSettings = (gameId: string, settings: GameSettings) => {
    setGameSettings(prev => ({
      ...prev,
      [gameId]: settings
    }));
  };

  const getGameSettings = (gameId: string): GameSettings | null => {
    return gameSettings[gameId] || null;
  };

  return (
    <GameSettingsContext.Provider
      value={{
        gameSettings,
        applyGameSettings,
        getGameSettings,
        defaultGameSettings: defaultSettings
      }}
    >
      {children}
    </GameSettingsContext.Provider>
  );
};

export const useGameSettings = () => {
  const context = useContext(GameSettingsContext);
  if (context === undefined) {
    throw new Error('useGameSettings must be used within a GameSettingsProvider');
  }
  return context;
};
