
import { Code2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { usePaywall } from '@/contexts/PaywallContext';

const DeveloperSettings = () => {
  const { paywallEnabled, togglePaywall } = usePaywall();

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
      </div>
    </div>
  );
};

export default DeveloperSettings;
