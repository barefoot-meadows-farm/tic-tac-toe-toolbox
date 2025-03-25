
import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { useToast } from "@/components/ui/use-toast";

type ThemeContextType = {
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

// Track if toast was recently shown to prevent spamming
let toastDebounceTimers = {
  primaryColor: 0,
  boardSize: 0,
  boardStyle: 0,
  boardColor: 0,
  animationSpeed: 0,
  player1Symbol: 0,
  player2Symbol: 0
};

// Debounce time in milliseconds
const DEBOUNCE_TIME = 1000;

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const [primaryColor, setPrimaryColor] = useState("#7C3AED"); // Default primary color
  const [boardSize, setBoardSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [boardStyle, setBoardStyle] = useState<'classic' | 'minimal' | 'modern'>('modern');
  const [boardColor, setBoardColor] = useState("#f3f4f6");
  const [animationSpeed, setAnimationSpeed] = useState(75);
  const [player1Symbol, setPlayer1Symbol] = useState('X');
  const [player2Symbol, setPlayer2Symbol] = useState('O');
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const loadSettings = () => {
      try {
        // Primary color
        const storedPrimaryColor = localStorage.getItem('primaryColor');
        if (storedPrimaryColor) {
          setPrimaryColor(storedPrimaryColor);
        }

        // Board settings
        const storedBoardSize = localStorage.getItem('boardSize') as 'small' | 'medium' | 'large' | null;
        if (storedBoardSize) {
          setBoardSize(storedBoardSize);
        }

        const storedBoardStyle = localStorage.getItem('boardStyle') as 'classic' | 'minimal' | 'modern' | null;
        if (storedBoardStyle) {
          setBoardStyle(storedBoardStyle);
        }

        const storedBoardColor = localStorage.getItem('boardColor');
        if (storedBoardColor) {
          setBoardColor(storedBoardColor);
        }

        // Animation and symbols
        const storedAnimationSpeed = localStorage.getItem('animationSpeed');
        if (storedAnimationSpeed) {
          setAnimationSpeed(parseInt(storedAnimationSpeed));
        }

        const storedPlayer1Symbol = localStorage.getItem('player1Symbol');
        if (storedPlayer1Symbol) {
          setPlayer1Symbol(storedPlayer1Symbol);
        }

        const storedPlayer2Symbol = localStorage.getItem('player2Symbol');
        if (storedPlayer2Symbol) {
          setPlayer2Symbol(storedPlayer2Symbol);
        }
        
        setInitialLoadComplete(true);
      } catch (error) {
        console.error("Error loading theme settings:", error);
        setInitialLoadComplete(true);
      }
    };

    loadSettings();
  }, []);

  // Convert hex to HSL for CSS variables
  const hexToHSL = (hex: string): string => {
    try {
      // Remove the # if present
      hex = hex.replace(/^#/, '');
      
      // Parse the hex values
      let r = parseInt(hex.substring(0, 2), 16) / 255;
      let g = parseInt(hex.substring(2, 4), 16) / 255;
      let b = parseInt(hex.substring(4, 6), 16) / 255;
      
      // Find the min and max values to determine lightness
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h = 0, s = 0, l = (max + min) / 2;
      
      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
        }
        
        h = Math.round(h * 60);
      }
      
      s = Math.round(s * 100);
      l = Math.round(l * 100);
      
      return `${h} ${s}% ${l}%`;
    } catch (error) {
      console.error("Error converting hex to HSL:", error);
      return "262 83% 58%"; // Default purple if conversion fails
    }
  };

  // Apply theme settings whenever they change
  useEffect(() => {
    if (!initialLoadComplete) return;
    
    // Apply CSS variable for primary color
    document.documentElement.style.setProperty('--primary', hexToHSL(primaryColor));
    
    // Remove dark mode class if it was previously applied
    document.documentElement.classList.remove('dark');
  }, [primaryColor, initialLoadComplete]);

  // Helper function to show toast with debounce
  const showToastWithDebounce = (
    key: keyof typeof toastDebounceTimers, 
    title: string, 
    description: string
  ) => {
    const now = Date.now();
    if (now - toastDebounceTimers[key] > DEBOUNCE_TIME) {
      toast({
        title,
        description,
      });
      toastDebounceTimers[key] = now;
    }
  };

  const handleSetPrimaryColor = (color: string) => {
    setPrimaryColor(color);
    localStorage.setItem('primaryColor', color);
    
    showToastWithDebounce(
      'primaryColor',
      "Color theme updated",
      "The app's primary color has been updated."
    );
  };

  const handleSetBoardSize = (size: 'small' | 'medium' | 'large') => {
    setBoardSize(size);
    localStorage.setItem('boardSize', size);
    
    showToastWithDebounce(
      'boardSize',
      "Board size updated",
      `Game board size set to ${size}.`
    );
  };

  const handleSetBoardStyle = (style: 'classic' | 'minimal' | 'modern') => {
    setBoardStyle(style);
    localStorage.setItem('boardStyle', style);
    
    showToastWithDebounce(
      'boardStyle',
      "Board style updated",
      `Game board style set to ${style}.`
    );
  };

  const handleSetBoardColor = (color: string) => {
    setBoardColor(color);
    localStorage.setItem('boardColor', color);
    
    showToastWithDebounce(
      'boardColor',
      "Board color updated",
      "Game board background color has been updated."
    );
  };

  const handleSetAnimationSpeed = (speed: number) => {
    setAnimationSpeed(speed);
    localStorage.setItem('animationSpeed', String(speed));
    
    showToastWithDebounce(
      'animationSpeed',
      "Animation speed updated",
      `Game animations ${speed < 25 ? 'slowed down' : speed > 75 ? 'sped up' : 'set to medium speed'}.`
    );
  };

  const handleSetPlayer1Symbol = (symbol: string) => {
    if (symbol.length > 2) symbol = symbol.substring(0, 2);
    if (symbol.trim().length === 0) symbol = 'X'; // Default if empty
    setPlayer1Symbol(symbol);
    localStorage.setItem('player1Symbol', symbol);
    
    showToastWithDebounce(
      'player1Symbol',
      "Player 1 symbol updated",
      `Player 1 will now use the symbol "${symbol}".`
    );
  };

  const handleSetPlayer2Symbol = (symbol: string) => {
    if (symbol.length > 2) symbol = symbol.substring(0, 2);
    if (symbol.trim().length === 0) symbol = 'O'; // Default if empty
    setPlayer2Symbol(symbol);
    localStorage.setItem('player2Symbol', symbol);
    
    showToastWithDebounce(
      'player2Symbol',
      "Player 2 symbol updated",
      `Player 2 will now use the symbol "${symbol}".`
    );
  };

  const handleSetQuickSymbols = (symbols: [string, string]) => {
    setPlayer1Symbol(symbols[0]);
    setPlayer2Symbol(symbols[1]);
    localStorage.setItem('player1Symbol', symbols[0]);
    localStorage.setItem('player2Symbol', symbols[1]);
    
    showToastWithDebounce(
      'player1Symbol', // We can use either key here
      "Game symbols updated",
      `Player symbols changed to "${symbols[0]}" and "${symbols[1]}".`
    );
  };

  // Combine context value with memoization for better performance
  const contextValue = useMemo(() => ({
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
  }), [
    primaryColor, 
    boardSize, 
    boardStyle, 
    boardColor, 
    animationSpeed, 
    player1Symbol, 
    player2Symbol
  ]);

  return (
    <ThemeContext.Provider value={contextValue}>
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
