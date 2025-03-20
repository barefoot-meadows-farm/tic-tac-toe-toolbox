
import { User } from 'lucide-react';
import { Button } from '@/components/ui/button';

const UserProfileSettings = () => {
  return (
    <div className="border rounded-lg p-4">
      <div className="mb-4">
        <div className="flex items-center mb-1">
          <User className="mr-2 h-4 w-4" />
          <h3 className="text-lg font-medium">User Profile</h3>
        </div>
        <p className="text-sm text-muted-foreground">Manage your personal information and account details.</p>
      </div>
      
      <div className="space-y-4">
        <div className="grid gap-2">
          <label htmlFor="username" className="font-medium">Username</label>
          <p className="text-xs text-muted-foreground">Your display name visible to other players.</p>
          <input 
            id="username"
            type="text" 
            className="w-full p-2 rounded-md border border-input bg-background" 
            placeholder="Enter username" 
          />
        </div>
        
        <div className="grid gap-2">
          <label htmlFor="email" className="font-medium">Email</label>
          <p className="text-xs text-muted-foreground">Your email address for account recovery and notifications.</p>
          <input 
            id="email"
            type="email" 
            className="w-full p-2 rounded-md border border-input bg-background" 
            placeholder="Enter email" 
          />
        </div>
        
        <Button>Update Profile</Button>
      </div>
    </div>
  );
};

export default UserProfileSettings;
