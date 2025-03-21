
import { Shield, BarChart } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

const ActivitySettings = () => {
  return (
    <div className="border rounded-lg p-4">
      <div className="mb-4">
        <div className="flex items-center mb-1">
          <Shield className="mr-2 h-4 w-4" />
          <h3 className="text-lg font-medium">Activity & Statistics</h3>
        </div>
        <p className="text-sm text-muted-foreground">Control what information is visible to others.</p>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-medium">Account Activity Privacy</span>
            <p className="text-xs text-muted-foreground">Hide your online status and activity from other players.</p>
          </div>
          <Switch id="activity-privacy" />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <BarChart className="mr-2 h-4 w-4" />
            <div>
              <span className="font-medium">Show Game Statistics</span>
              <p className="text-xs text-muted-foreground">Display your win/loss record and other stats on your profile.</p>
            </div>
          </div>
          <Switch id="show-statistics" defaultChecked />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <span className="font-medium">Public Match History</span>
            <p className="text-xs text-muted-foreground">Allow others to view your past matches.</p>
          </div>
          <Switch id="public-matches" />
        </div>
      </div>
    </div>
  );
};

export default ActivitySettings;
