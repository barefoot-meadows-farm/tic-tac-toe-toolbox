
import React, { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";

type ThemeContextType = {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  primaryColor: string;
  setPrimaryColor: (color: string) => void;
  boardSize: 'small' | 'medium' | 'large';
  setBoardSize: (size: 'small' | 'medium' | 'large') => void;
  boardStyle: 'classic' | 'minimal' | 'modern';
  setBoardStyle: (style: 'classic' | 'minimal' | 'modern') => void;
  boardColor: string;
  setBoardColor: (color: string) => void;
  animationSpeed: number;
  setAnimationSpeed: (speed: number) => void;
  player1Symbol: string;
  setPlayer1Symbol: (symbol: string) => void;
  player2Symbol: string;
  setPlayer2Symbol: (symbol: string) => void;
  setQuickSymbols: (symbols: [string, string]) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [primaryColor, setPrimaryColor] = useState("#7C3AED"); // Default primary color
  const [boardSize, setBoardSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [boardStyle, setBoardStyle] = useState<'classic' | 'minimal' | 'modern'>('modern');
  const [boardColor, setBoardColor] = useState("#f3f4f6");
  const [animationSpeed, setAnimationSpeed] = useState(75);
  const [player1Symbol, setPlayer1Symbol] = useState('X');
  const [player2Symbol, setPlayer2Symbol] = useState('O');

  // Load settings from localStorage on mount
  useEffect(() => {
    const loadSettings = () => {
      const isDarkMode = localStorage.getItem('isDarkMode') === 'true';
      const primaryColor = localStorage.getItem('primaryColor') || "#7C3AED";
      const boardSize = localStorage.getItem('boardSize') as 'small' | 'medium' | 'large' || 'medium';
      const boardStyle = localStorage.getItem('boardStyle') as 'classic' | 'minimal' | 'modern' || 'modern';
      const boardColor = localStorage.getItem('boardColor') || "#f3f4f6";
      const animationSpeed = parseInt(localStorage.getItem('animationSpeed') || "75");
      const player1Symbol = localStorage.getItem('player1Symbol') || 'X';
      const player2Symbol = localStorage.getItem('player2Symbol') || 'O';

      setIsDarkMode(isDarkMode);
      setPrimaryColor(primaryColor);
      setBoardSize(boardSize);
      setBoardStyle(boardStyle);
      setBoardColor(boardColor);
      setAnimationSpeed(animationSpeed);
      setPlayer1Symbol(player1Symbol);
      setPlayer2Symbol(player2Symbol);

      // Apply dark mode if enabled
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

      // Apply primary color
      document.documentElement.style.setProperty('--primary-color', primaryColor);
    };

    loadSettings();
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('isDarkMode', String(newMode));
    
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    toast({
      title: `${newMode ? 'Dark' : 'Light'} mode enabled`,
      description: `The app theme has been changed to ${newMode ? 'dark' : 'light'} mode.`,
    });
  };

  const handleSetPrimaryColor = (color: string) => {
    setPrimaryColor(color);
    localStorage.setItem('primaryColor', color);
    document.documentElement.style.setProperty('--primary-color', color);
    
    toast({
      title: "Color theme updated",
      description: "The app's primary color has been updated.",
    });
  };

  const handleSetBoardSize = (size: 'small' | 'medium' | 'large') => {
    setBoardSize(size);
    localStorage.setItem('boardSize', size);
    
    toast({
      title: "Board size updated",
      description: `Game board size set to ${size}.`,
    });
  };

  const handleSetBoardStyle = (style: 'classic' | 'minimal' | 'modern') => {
    setBoardStyle(style);
    localStorage.setItem('boardStyle', style);
    
    toast({
      title: "Board style updated",
      description: `Game board style set to ${style}.`,
    });
  };

  const handleSetBoardColor = (color: string) => {
    setBoardColor(color);
    localStorage.setItem('boardColor', color);
    
    toast({
      title: "Board color updated",
      description: "Game board background color has been updated.",
    });
  };

  const handleSetAnimationSpeed = (speed: number) => {
    setAnimationSpeed(speed);
    localStorage.setItem('animationSpeed', String(speed));
  };

  const handleSetPlayer1Symbol = (symbol: string) => {
    if (symbol.length > 2) symbol = symbol.substring(0, 2);
    setPlayer1Symbol(symbol);
    localStorage.setItem('player1Symbol', symbol);
    
    toast({
      title: "Player 1 symbol updated",
      description: `Player 1 will now use the symbol "${symbol}".`,
    });
  };

  const handleSetPlayer2Symbol = (symbol: string) => {
    if (symbol.length > 2) symbol = symbol.substring(0, 2);
    setPlayer2Symbol(symbol);
    localStorage.setItem('player2Symbol', symbol);
    
    toast({
      title: "Player 2 symbol updated",
      description: `Player 2 will now use the symbol "${symbol}".`,
    });
  };

  const handleSetQuickSymbols = (symbols: [string, string]) => {
    setPlayer1Symbol(symbols[0]);
    setPlayer2Symbol(symbols[1]);
    localStorage.setItem('player1Symbol', symbols[0]);
    localStorage.setItem('player2Symbol', symbols[1]);
    
    toast({
      title: "Game symbols updated",
      description: `Player symbols changed to "${symbols[0]}" and "${symbols[1]}".`,
    });
  };

  return (
    <ThemeContext.Provider
      value={{
        isDarkMode,
        toggleDarkMode,
        primaryColor,
        setPrimaryColor: handleSetPrimaryColor,
        boardSize,
        setBoardSize: handleSetBoardSize,
        boardStyle,
        setBoardStyle: handleSetBoardStyle,
        boardColor,
        setBoardColor: handleSetBoardColor,
        animationSpeed,
        setAnimationSpeed: handleSetAnimationSpeed,
        player1Symbol,
        setPlayer1Symbol: handleSetPlayer1Symbol,
        player2Symbol,
        setPlayer2Symbol: handleSetPlayer2Symbol,
        setQuickSymbols: handleSetQuickSymbols
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
