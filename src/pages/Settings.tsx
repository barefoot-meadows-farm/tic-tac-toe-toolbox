
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Gamepad, Palette } from 'lucide-react';
import Navbar from "@/components/Navbar.tsx";
import Footer from "@/components/Footer.tsx";
import { useTheme } from '@/contexts/ThemeContext';
import GameplaySettings from '@/components/settings/gameplay/GameplaySettings';
import StandardGameSettings from '@/components/StandardGameSettings';

const Settings = () => {
  const { 
    primaryColor, 
    setPrimaryColor,
    player1Symbol,
    setPlayer1Symbol,
    player2Symbol,
    setPlayer2Symbol
  } = useTheme();

  const colorOptions = [
    { color: "#7C3AED", name: "Purple" }, // Default primary
    { color: "#3B82F6", name: "Blue" },
    { color: "#10B981", name: "Green" },
    { color: "#F59E0B", name: "Yellow" },
    { color: "#EF4444", name: "Red" },
  ];

  const handleColorSelect = (color: string) => {
    if (color !== primaryColor) {
      setPrimaryColor(color);
    }
  };

  const handlePlayer1SymbolChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value && value !== player1Symbol) {
      setPlayer1Symbol(value.substring(0, 2));
    }
  };

  const handlePlayer2SymbolChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value && value !== player2Symbol) {
      setPlayer2Symbol(value.substring(0, 2));
    }
  };

  const symbolSets = [
    ['X', 'O'],
    ['♠', '♥'],
    ['⭐', '⚡'],
    ['🔴', '🔵'],
  ];

  const handleQuickSymbolSelect = (p1: string, p2: string) => {
    setPlayer1Symbol(p1);
    setPlayer2Symbol(p2);
  };

  return (
      <div className="min-h-screen pt-24 pb-16">
          <Navbar/>
          <main className="flex-grow pt-24 pb-16">
              <div className="container mx-auto px-4 md:px-6">
                  <div className="flex flex-col space-y-8">
                      <div className="flex flex-col space-y-1">
                          <div className="flex items-center justify-between">
                              <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                              <Button variant="outline" size="sm" asChild>
                                  <Link to="/" className="flex items-center gap-2">
                                      <ArrowLeft className="h-4 w-4"/>
                                      Return to Main Page
                                  </Link>
                              </Button>
                          </div>
                          <p className="text-muted-foreground">
                              Customize your Tic Tac Toolbox experience
                          </p>
                      </div>

                      <div className="rounded-lg border p-6 space-y-8">
                          {/* Gameplay Settings */}
                          <div className="space-y-4">
                              <div className="flex items-center space-x-2">
                                <Gamepad className="h-5 w-5" />
                                <h2 className="text-2xl font-semibold">Game Settings</h2>
                              </div>
                              <div className="pl-7">
                                <StandardGameSettings gameId="traditional" />
                              </div>
                          </div>
                          
                          {/* Simplified Appearance Settings */}
                          <div className="space-y-4">
                              <div className="flex items-center space-x-2">
                                <Palette className="h-5 w-5" />
                                <h2 className="text-2xl font-semibold">Appearance</h2>
                              </div>
                              
                              <div className="pl-7 space-y-6">
                                  {/* Theme Colors */}
                                  <div className="space-y-2">
                                      <h3 className="text-lg font-medium">Theme Color</h3>
                                      <div className="flex flex-wrap gap-2">
                                          {colorOptions.map((option) => (
                                              <Button 
                                                  key={option.color}
                                                  variant="outline" 
                                                  size="sm" 
                                                  className={`h-8 w-8 p-0 rounded-full ${primaryColor === option.color ? 'ring-2 ring-offset-2 ring-offset-background ring-primary' : ''}`}
                                                  style={{ backgroundColor: option.color }}
                                                  onClick={() => handleColorSelect(option.color)}
                                                  aria-label={`Set color to ${option.name}`}
                                                  type="button"
                                              >
                                                  {primaryColor === option.color && (
                                                      <span className="absolute inset-0 flex items-center justify-center">
                                                          <span className="h-2 w-2 rounded-full bg-white"></span>
                                                      </span>
                                                  )}
                                              </Button>
                                          ))}
                                      </div>
                                  </div>
                                  
                                  {/* Game Symbols */}
                                  <div className="space-y-2">
                                      <h3 className="text-lg font-medium">Game Symbols</h3>
                                      
                                      <div className="grid grid-cols-2 gap-4 max-w-md">
                                          <div>
                                              <label htmlFor="player1-symbol" className="block text-sm font-medium mb-1">Player 1</label>
                                              <input 
                                                  id="player1-symbol"
                                                  type="text"
                                                  className="w-full p-2 border rounded"
                                                  value={player1Symbol}
                                                  onChange={handlePlayer1SymbolChange}
                                                  maxLength={2}
                                              />
                                          </div>
                                          <div>
                                              <label htmlFor="player2-symbol" className="block text-sm font-medium mb-1">Player 2</label>
                                              <input 
                                                  id="player2-symbol"
                                                  type="text"
                                                  className="w-full p-2 border rounded"
                                                  value={player2Symbol}
                                                  onChange={handlePlayer2SymbolChange}
                                                  maxLength={2}
                                              />
                                          </div>
                                      </div>
                                      
                                      <div className="mt-2">
                                          <p className="text-sm font-medium mb-1">Quick Select</p>
                                          <div className="flex flex-wrap gap-2">
                                              {symbolSets.map(([p1, p2], index) => (
                                                  <Button 
                                                      key={index}
                                                      variant={player1Symbol === p1 && player2Symbol === p2 ? "default" : "outline"}
                                                      size="sm"
                                                      onClick={() => handleQuickSymbolSelect(p1, p2)}
                                                  >
                                                      {p1}/{p2}
                                                  </Button>
                                              ))}
                                          </div>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </main>
          <Footer/>
      </div>
  );
};

export default Settings;
