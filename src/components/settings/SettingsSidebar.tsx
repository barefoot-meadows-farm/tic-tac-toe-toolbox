
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Gamepad, Palette, Volume2, Accessibility, User } from 'lucide-react';

interface SettingsSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const SettingsSidebar = ({ activeTab, onTabChange }: SettingsSidebarProps) => {
  return (
    <div className="flex flex-col space-y-4">
      <Button
        variant={activeTab === "gameplay" ? "default" : "ghost"}
        className="justify-start"
        onClick={() => onTabChange("gameplay")}
      >
        <Gamepad className="mr-2 h-4 w-4" />
        Gameplay
      </Button>
      <Button
        variant={activeTab === "appearance" ? "default" : "ghost"}
        className="justify-start"
        onClick={() => onTabChange("appearance")}
      >
        <Palette className="mr-2 h-4 w-4" />
        Appearance
      </Button>
      <Button
        variant={activeTab === "audio" ? "default" : "ghost"}
        className="justify-start"
        onClick={() => onTabChange("audio")}
      >
        <Volume2 className="mr-2 h-4 w-4" />
        Audio
      </Button>
      <Button
        variant={activeTab === "accessibility" ? "default" : "ghost"}
        className="justify-start"
        onClick={() => onTabChange("accessibility")}
      >
        <Accessibility className="mr-2 h-4 w-4" />
        Accessibility
      </Button>
      <Button
        variant={activeTab === "account" ? "default" : "ghost"}
        className="justify-start"
        onClick={() => onTabChange("account")}
      >
        <User className="mr-2 h-4 w-4" />
        Account
      </Button>
    </div>
  );
};

export default SettingsSidebar;
