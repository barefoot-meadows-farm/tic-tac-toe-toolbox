
import React from 'react';
import { Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

const ThemeSettings: React.FC = () => {
  const { 
    isDarkMode, 
    toggleDarkMode, 
    primaryColor, 
    setPrimaryColor 
  } = useTheme();

  const colorOptions = [
    { color: "#7C3AED", name: "Purple" }, // Default primary
    { color: "#6366F1", name: "Indigo" },
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
    <div className="border rounded-lg p-4">
      <div className="mb-4">
        <div className="flex items-center mb-1">
          <Palette className="mr-2 h-4 w-4" />
          <h3 className="text-lg font-medium">Theme</h3>
        </div>
        <p className="text-sm text-muted-foreground">Change the overall look and feel of the application.</p>
      </div>
      
      <div className="space-y-4">
        <div className="grid gap-2">
          <span className="font-medium">Color Theme</span>
          <p className="text-xs text-muted-foreground">Select a color palette for the application interface.</p>
          <div className="flex flex-wrap gap-2">
            {colorOptions.map((option) => (
              <Button 
                key={option.color}
                variant="outline" 
                size="sm" 
                className={cn(
                  "h-8 w-8 p-0 rounded-full",
                  primaryColor === option.color && "ring-2 ring-offset-2 ring-offset-background ring-primary"
                )}
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
        
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="dark-mode-toggle" className="font-medium cursor-pointer">Dark Mode</Label>
            <p className="text-xs text-muted-foreground">Switch between light and dark color schemes.</p>
          </div>
          <Switch 
            id="dark-mode-toggle" 
            checked={isDarkMode}
            onCheckedChange={toggleDarkMode}
          />
        </div>
      </div>
    </div>
  );
};

export default ThemeSettings;
