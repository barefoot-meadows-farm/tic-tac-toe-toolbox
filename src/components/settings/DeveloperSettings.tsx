import { Code2, Database, Wrench } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { usePaywall } from '@/contexts/PaywallContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useState } from 'react';

const DeveloperSettings = () => {
  const { paywallEnabled, togglePaywall } = usePaywall();
  const { toast } = useToast();
  const [devMode, setDevMode] = useState(localStorage.getItem('devMode') === 'true');
  const [debugLogging, setDebugLogging] = useState(localStorage.getItem('debugLogging') === 'true');

  const handleDevModeToggle = (checked: boolean) => {
    setDevMode(checked);
    localStorage.setItem('devMode', String(checked));
    toast({
      title: `Developer Mode ${checked ? 'Enabled' : 'Disabled'}`,
      description: `Extended developer tools are now ${checked ? 'available' : 'hidden'}.`,
    });
  };

  const handleDebugLoggingToggle = (checked: boolean) => {
    setDebugLogging(checked);
    localStorage.setItem('debugLogging', String(checked));
    toast({
      title: `Debug Logging ${checked ? 'Enabled' : 'Disabled'}`,
      description: `Console logging has been ${checked ? 'enabled' : 'disabled'}.`,
    });
  };

  const clearLocalStorage = () => {
    localStorage.clear();
    toast({
      title: "Local Storage Cleared",
      description: "All local storage data has been cleared. You may need to refresh the page.",
      variant: "destructive"
    });
  };

  const resetSettings = () => {
    const userSession = localStorage.getItem('supabase.auth.token');
    localStorage.clear();
    if (userSession) {
      localStorage.setItem('supabase.auth.token', userSession);
    }
    
    toast({
      title: "Settings Reset",
      description: "All settings have been reset to their default values. You may need to refresh the page.",
    });
  };

  return (
    <div className="border rounded-lg p-4">
      <div className="mb-4">
        <div className="flex items-center mb-1">
          <Code2 className="mr-2 h-4 w-4" />
          <h3 className="text-lg font-medium">Developer Options</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          These settings are for development purposes only.
        </p>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="paywall-toggle" className="font-medium cursor-pointer">
              Enable Paywall
            </Label>
            <p className="text-xs text-muted-foreground">
              Toggle the premium game paywall on/off during development.
            </p>
          </div>
          <Switch 
            id="paywall-toggle"
            checked={paywallEnabled}
            onCheckedChange={togglePaywall}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="dev-mode-toggle" className="font-medium cursor-pointer">
              Developer Mode
            </Label>
            <p className="text-xs text-muted-foreground">
              Enable additional developer tools and interfaces.
            </p>
          </div>
          <Switch 
            id="dev-mode-toggle"
            checked={devMode}
            onCheckedChange={handleDevModeToggle}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="debug-toggle" className="font-medium cursor-pointer">
              Debug Logging
            </Label>
            <p className="text-xs text-muted-foreground">
              Enable verbose logging to browser console.
            </p>
          </div>
          <Switch 
            id="debug-toggle"
            checked={debugLogging}
            onCheckedChange={handleDebugLoggingToggle}
          />
        </div>

        <div className="pt-2 border-t">
          <h4 className="text-sm font-medium mb-2 flex items-center">
            <Wrench className="h-4 w-4 mr-1" /> Tools
          </h4>
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearLocalStorage}
              className="text-destructive hover:text-destructive"
            >
              Clear Local Storage
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={resetSettings}
            >
              Reset All Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeveloperSettings;
