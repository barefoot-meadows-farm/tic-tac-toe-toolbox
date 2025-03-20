
import { User } from 'lucide-react';

const ConnectionSettings = () => {
  return (
    <div className="border rounded-lg p-4">
      <div className="mb-4">
        <div className="flex items-center mb-1">
          <User className="mr-2 h-4 w-4" />
          <h3 className="text-lg font-medium">Connection and Communication</h3>
        </div>
        <p className="text-sm text-muted-foreground">Manage how you connect and interact with other users.</p>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-medium">Email Notifications</span>
            <p className="text-xs text-muted-foreground">Receive updates and information via email.</p>
          </div>
          <input type="checkbox" className="h-4 w-4" />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <span className="font-medium">Game Invites</span>
            <p className="text-xs text-muted-foreground">Allow other players to invite you to games.</p>
          </div>
          <input type="checkbox" className="h-4 w-4" defaultChecked />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <span className="font-medium">Show Online Status</span>
            <p className="text-xs text-muted-foreground">Let others see when you're online and available to play.</p>
          </div>
          <input type="checkbox" className="h-4 w-4" defaultChecked />
        </div>
      </div>
    </div>
  );
};

export default ConnectionSettings;
