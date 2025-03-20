
import { User } from 'lucide-react';
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

const ConnectionSettings = () => {
  return (
    <AccordionItem value="connection-communication">
      <AccordionTrigger className="text-lg font-medium">
        <div className="flex items-center">
          <User className="mr-2 h-4 w-4" />
          Connection and Communication
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pt-2">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">Email Notifications</span>
            <input type="checkbox" className="h-4 w-4" />
          </div>
          
          <div className="flex items-center justify-between">
            <span className="font-medium">Game Invites</span>
            <input type="checkbox" className="h-4 w-4" defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <span className="font-medium">Show Online Status</span>
            <input type="checkbox" className="h-4 w-4" defaultChecked />
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default ConnectionSettings;
