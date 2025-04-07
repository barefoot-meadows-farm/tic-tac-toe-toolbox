
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Gamepad, Palette, Moon, Sun } from 'lucide-react';
import Navbar from "@/components/Navbar.tsx";
import Footer from "@/components/Footer.tsx";
import { useTheme } from '@/contexts/ThemeContext';
import StandardGameSettings from '@/components/StandardGameSettings';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const Settings = () => {
  const { 
    primaryColor, 
    setPrimaryColor,
    darkMode,
    toggleDarkMode
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
                                  <Link to="/" className="flex items-center gap-2 group" replace>
                                      <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1"/>
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
                                <div>
                                  <h2 className="text-2xl font-semibold">Game Settings</h2>
                                  <p className="text-sm text-muted-foreground">Sets universal game rules, which can be tweaked individually on each game</p>
                                </div>
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
                                  
                                  {/* Dark Mode Toggle */}
                                  <div className="space-y-2">
                                      <h3 className="text-lg font-medium">Dark Mode</h3>
                                      <div className="flex items-center space-x-2">
                                          <Switch 
                                              id="dark-mode" 
                                              checked={darkMode}
                                              onCheckedChange={toggleDarkMode}
                                          />
                                          <Label htmlFor="dark-mode" className="flex items-center gap-2">
                                              {darkMode ? (
                                                  <>
                                                      <Moon className="h-4 w-4" />
                                                      <span>Dark Mode</span>
                                                  </>
                                              ) : (
                                                  <>
                                                      <Sun className="h-4 w-4" />
                                                      <span>Light Mode</span>
                                                  </>
                                              )}
                                          </Label>
                                      </div>
                                      <p className="text-xs text-muted-foreground">
                                          Toggle between light and dark mode for the entire application.
                                      </p>
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
