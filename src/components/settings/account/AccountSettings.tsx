
import { User } from 'lucide-react';
import { Accordion } from "@/components/ui/accordion";
import UserProfileSettings from './UserProfileSettings';
import ConnectionSettings from './ConnectionSettings';
import DataPrivacySettings from './DataPrivacySettings';

const AccountSettings = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <User className="h-5 w-5" />
        <h2 className="text-2xl font-semibold">Account</h2>
      </div>
      
      <Accordion type="single" collapsible className="w-full">
        <UserProfileSettings />
        <ConnectionSettings />
        <DataPrivacySettings />
      </Accordion>
    </div>
  );
};

export default AccountSettings;
