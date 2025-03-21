
import { User } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import UserProfileSettings from './UserProfileSettings';
import ConnectionSettings from './ConnectionSettings';
import DataPrivacySettings from './DataPrivacySettings';
import LanguageSettings from './LanguageSettings';
import SecuritySettings from './SecuritySettings';
import ActivitySettings from './ActivitySettings';

const AccountSettings = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <User className="h-5 w-5" />
        <h2 className="text-2xl font-semibold">Account</h2>
      </div>
      
      <div className="space-y-4">
        <UserProfileSettings />
        <LanguageSettings />
        <SecuritySettings />
        <ActivitySettings />
        <ConnectionSettings />
        <DataPrivacySettings />
      </div>
    </div>
  );
};

export default AccountSettings;
