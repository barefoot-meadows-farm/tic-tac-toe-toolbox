
import { Ear } from 'lucide-react';

const AuditoryAccessibilitySettings = () => {
  return (
    <div className="border rounded-lg p-4">
      <div className="mb-4">
        <div className="flex items-center mb-1">
          <Ear className="mr-2 h-4 w-4" />
          <h3 className="text-lg font-medium">Auditory Accessibility</h3>
        </div>
        <p className="text-sm text-muted-foreground">Configure audio accessibility features for users with hearing impairments.</p>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-medium">Screen Reader Support</span>
            <p className="text-xs text-muted-foreground">Improves compatibility with screen reader technologies.</p>
          </div>
          <input type="checkbox" className="h-4 w-4" defaultChecked />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <span className="font-medium">Audio Cues for Game Events</span>
            <p className="text-xs text-muted-foreground">Adds distinct sounds to indicate game state changes.</p>
          </div>
          <input type="checkbox" className="h-4 w-4" defaultChecked />
        </div>
      </div>
    </div>
  );
};

export default AuditoryAccessibilitySettings;
