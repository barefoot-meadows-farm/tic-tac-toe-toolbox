
import { User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

const UserProfileSettings = () => {
  return (
    <AccordionItem value="user-profile">
      <AccordionTrigger className="text-lg font-medium">
        <div className="flex items-center">
          <User className="mr-2 h-4 w-4" />
          User Profile
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pt-2">
        <div className="space-y-4">
          <div className="grid gap-2">
            <label htmlFor="username" className="font-medium">Username</label>
            <input 
              id="username"
              type="text" 
              className="w-full p-2 rounded-md border border-input bg-background" 
              placeholder="Enter username" 
            />
          </div>
          
          <div className="grid gap-2">
            <label htmlFor="email" className="font-medium">Email</label>
            <input 
              id="email"
              type="email" 
              className="w-full p-2 rounded-md border border-input bg-background" 
              placeholder="Enter email" 
            />
          </div>
          
          <Button>Update Profile</Button>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default UserProfileSettings;
