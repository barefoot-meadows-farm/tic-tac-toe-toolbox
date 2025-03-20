
import { User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

const DataPrivacySettings = () => {
  return (
    <AccordionItem value="data-privacy">
      <AccordionTrigger className="text-lg font-medium">
        <div className="flex items-center">
          <User className="mr-2 h-4 w-4" />
          Data and Privacy
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pt-2">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">Save Game History</span>
            <input type="checkbox" className="h-4 w-4" defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <span className="font-medium">Share Usage Statistics</span>
            <input type="checkbox" className="h-4 w-4" />
          </div>
          
          <Button variant="destructive">Delete Account</Button>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default DataPrivacySettings;
