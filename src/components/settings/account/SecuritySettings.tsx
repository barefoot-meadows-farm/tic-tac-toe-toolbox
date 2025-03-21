
import { Lock, Key, HardDriveDownload, Trash2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';

const SecuritySettings = () => {
  return (
    <div className="border rounded-lg p-4">
      <div className="mb-4">
        <div className="flex items-center mb-1">
          <Lock className="mr-2 h-4 w-4" />
          <h3 className="text-lg font-medium">Security & Data</h3>
        </div>
        <p className="text-sm text-muted-foreground">Manage account security and your game data.</p>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Key className="mr-2 h-4 w-4" />
            <div>
              <span className="font-medium">Two Factor Authentication</span>
              <p className="text-xs text-muted-foreground">Add an extra layer of security to your account.</p>
            </div>
          </div>
          <Switch id="two-factor" />
        </div>
        
        <div className="pt-2">
          <div className="flex items-center mb-2">
            <HardDriveDownload className="mr-2 h-4 w-4" />
            <span className="font-medium">Game Data Export</span>
          </div>
          <p className="text-xs text-muted-foreground mb-2">Download your game history and statistics.</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">JSON</Button>
            <Button variant="outline" size="sm">CSV</Button>
            <Button variant="outline" size="sm">PDF</Button>
          </div>
        </div>
        
        <div className="pt-2">
          <div className="flex items-center mb-2">
            <Trash2 className="mr-2 h-4 w-4 text-destructive" />
            <span className="font-medium">Clear All Data</span>
          </div>
          <p className="text-xs text-muted-foreground mb-2">Permanently delete all your game data and statistics.</p>
          <Button variant="destructive" size="sm">Clear Game Data</Button>
        </div>
      </div>
    </div>
  );
};

export default SecuritySettings;
