
import { User } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DataPrivacySettings = () => {
  return (
    <div className="border rounded-lg p-4">
      <div className="mb-4">
        <div className="flex items-center mb-1">
          <User className="mr-2 h-4 w-4" />
          <h3 className="text-lg font-medium">Data and Privacy</h3>
        </div>
        <p className="text-sm text-muted-foreground">Control how your data is stored and used.</p>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-medium">Save Game History</span>
            <p className="text-xs text-muted-foreground">Keep records of your past games for review.</p>
          </div>
          <input type="checkbox" className="h-4 w-4" defaultChecked />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <span className="font-medium">Share Usage Statistics</span>
            <p className="text-xs text-muted-foreground">Help improve the app by sending anonymous usage data.</p>
          </div>
          <input type="checkbox" className="h-4 w-4" />
        </div>
        
        <Button variant="destructive">Delete Account</Button>
      </div>
    </div>
  );
};

export default DataPrivacySettings;
