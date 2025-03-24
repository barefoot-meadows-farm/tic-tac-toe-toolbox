
import { Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useEffect } from 'react';

const ThemeSettings = () => {
  const { 
    isDarkMode, 
    toggleDarkMode, 
    primaryColor, 
    setPrimaryColor 
  } = useTheme();

  // Update CSS variable when primary color changes
  useEffect(() => {
    const root = document.documentElement;
    const hsl = hexToHSL(primaryColor);
    if (hsl) {
      root.style.setProperty('--primary', hsl);
    }
  }, [primaryColor]);

  // Convert hex to HSL for CSS variables
  const hexToHSL = (hex: string): string | null => {
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
      return null;
    }
  };

  const colorOptions = [
    { color: "#7C3AED", name: "Purple" }, // Default primary
    { color: "#6366F1", name: "Indigo" },
    { color: "#3B82F6", name: "Blue" },
    { color: "#10B981", name: "Green" },
    { color: "#F59E0B", name: "Yellow" },
    { color: "#EF4444", name: "Red" },
  ];

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
                className={`h-8 w-8 p-0 rounded-full`}
                style={{ backgroundColor: option.color }}
                onClick={() => setPrimaryColor(option.color)}
                aria-label={`Set color to ${option.name}`}
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
