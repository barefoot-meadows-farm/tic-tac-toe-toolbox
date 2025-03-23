
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import SettingsSidebar from '@/components/settings/SettingsSidebar';
import GameplaySettings from '@/components/settings/gameplay/GameplaySettings';
import AppearanceSettings from '@/components/settings/appearance/AppearanceSettings';
import AudioSettings from '@/components/settings/audio/AudioSettings';
import AccessibilitySettings from '@/components/settings/accessibility/AccessibilitySettings';
import AccountSettings from '@/components/settings/account/AccountSettings';
import DeveloperSettings from '@/components/settings/DeveloperSettings';
import Navbar from "@/components/Navbar.tsx";
import Footer from "@/components/Footer.tsx";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("gameplay");

  return (
      <div className="min-h-screen pt-24 pb-16">
          <Navbar/>
          <main className="flex-grow pt-24 pb-16">
              <div className="container mx-auto px-4 md:px-6">
                  <div className="flex flex-col space-y-6">
                      <div className="flex flex-col space-y-1">
                          <div className="flex items-center justify-between">
                              <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                              <Button variant="outline" size="sm" asChild>
                                  <Link to="/" className="flex items-center gap-2">
                                      <ArrowLeft className="h-4 w-4"/>
                                      Return to Main Page
                                  </Link>
                              </Button>
                          </div>
                          <p className="text-muted-foreground">
                              Customize your Tic Tac Toolbox experience
                          </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-6">
                          {/* Sidebar/Navigation */}
                          <SettingsSidebar activeTab={activeTab} onTabChange={setActiveTab}/>

                          {/* Content Area */}
                          <div className="bg-card rounded-lg border p-6">
                              {activeTab === "gameplay" && <GameplaySettings/>}
                              {activeTab === "appearance" && <AppearanceSettings/>}
                              {activeTab === "audio" && <AudioSettings/>}
                              {activeTab === "accessibility" && <AccessibilitySettings/>}
                              {activeTab === "account" && <AccountSettings/>}
                              {activeTab === "developer" && <DeveloperSettings/>}
                          </div>
                      </div>
                  </div>
              </div>
          </main>
          <Footer/>
      </div>
);
};

export default Settings;
