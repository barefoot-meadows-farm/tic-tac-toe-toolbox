import { useState } from 'react';
import { 
  Gamepad, Palette, Volume2, Accessibility, User, 
  ChevronDown, ChevronRight, Sidebar, Dice1, Monitor, 
  Grid3X3, SquareUser, Music, VolumeX, 
  Ear, LayoutGrid, BrainCircuit
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("gameplay");

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col space-y-6">
          <div className="flex flex-col space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">
              Customize your Tic Tac Toolbox experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-6">
            {/* Sidebar/Navigation */}
            <div className="flex flex-col space-y-4">
              <Button
                variant={activeTab === "gameplay" ? "default" : "ghost"}
                className="justify-start"
                onClick={() => setActiveTab("gameplay")}
              >
                <Gamepad className="mr-2 h-4 w-4" />
                Gameplay
              </Button>
              <Button
                variant={activeTab === "appearance" ? "default" : "ghost"}
                className="justify-start"
                onClick={() => setActiveTab("appearance")}
              >
                <Palette className="mr-2 h-4 w-4" />
                Appearance
              </Button>
              <Button
                variant={activeTab === "audio" ? "default" : "ghost"}
                className="justify-start"
                onClick={() => setActiveTab("audio")}
              >
                <Volume2 className="mr-2 h-4 w-4" />
                Audio
              </Button>
              <Button
                variant={activeTab === "accessibility" ? "default" : "ghost"}
                className="justify-start"
                onClick={() => setActiveTab("accessibility")}
              >
                <Accessibility className="mr-2 h-4 w-4" />
                Accessibility
              </Button>
              <Button
                variant={activeTab === "account" ? "default" : "ghost"}
                className="justify-start"
                onClick={() => setActiveTab("account")}
              >
                <User className="mr-2 h-4 w-4" />
                Account
              </Button>
            </div>

            {/* Content Area */}
            <div className="bg-card rounded-lg border p-6">
              {/* Gameplay Section */}
              {activeTab === "gameplay" && (
                <div className="space-y-6">
                  <div className="flex items-center space-x-2">
                    <Gamepad className="h-5 w-5" />
                    <h2 className="text-2xl font-semibold">Gameplay</h2>
                  </div>
                  
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="game-rules">
                      <AccordionTrigger className="text-lg font-medium">
                        <div className="flex items-center">
                          <Dice1 className="mr-2 h-4 w-4" />
                          Game Rules
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pt-2">
                        <div className="space-y-4">
                          <div className="grid gap-2">
                            <label htmlFor="difficulty" className="font-medium">Default Difficulty</label>
                            <select 
                              id="difficulty"
                              className="w-full p-2 rounded-md border border-input bg-background"
                            >
                              <option value="easy">Easy</option>
                              <option value="medium">Medium</option>
                              <option value="hard">Hard</option>
                            </select>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="font-medium">First Player</span>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm">X</Button>
                              <Button variant="outline" size="sm">Random</Button>
                              <Button variant="outline" size="sm">O</Button>
                            </div>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="display-options">
                      <AccordionTrigger className="text-lg font-medium">
                        <div className="flex items-center">
                          <Monitor className="mr-2 h-4 w-4" />
                          Display Options
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pt-2">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Show Move History</span>
                            <input type="checkbox" className="h-4 w-4" />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Show Coordinates</span>
                            <input type="checkbox" className="h-4 w-4" />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Highlight Winning Line</span>
                            <input type="checkbox" className="h-4 w-4" defaultChecked />
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              )}

              {/* Appearance Section */}
              {activeTab === "appearance" && (
                <div className="space-y-6">
                  <div className="flex items-center space-x-2">
                    <Palette className="h-5 w-5" />
                    <h2 className="text-2xl font-semibold">Appearance</h2>
                  </div>
                  
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="theme">
                      <AccordionTrigger className="text-lg font-medium">
                        <div className="flex items-center">
                          <Palette className="mr-2 h-4 w-4" />
                          Theme
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pt-2">
                        <div className="space-y-4">
                          <div className="grid gap-2">
                            <span className="font-medium">Color Theme</span>
                            <div className="flex flex-wrap gap-2">
                              <Button variant="outline" size="sm" className="h-8 w-8 p-0 bg-primary"></Button>
                              <Button variant="outline" size="sm" className="h-8 w-8 p-0 bg-indigo-500"></Button>
                              <Button variant="outline" size="sm" className="h-8 w-8 p-0 bg-blue-500"></Button>
                              <Button variant="outline" size="sm" className="h-8 w-8 p-0 bg-green-500"></Button>
                              <Button variant="outline" size="sm" className="h-8 w-8 p-0 bg-yellow-500"></Button>
                              <Button variant="outline" size="sm" className="h-8 w-8 p-0 bg-red-500"></Button>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Dark Mode</span>
                            <input type="checkbox" className="h-4 w-4" />
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="game-board">
                      <AccordionTrigger className="text-lg font-medium">
                        <div className="flex items-center">
                          <Grid3X3 className="mr-2 h-4 w-4" />
                          Game Board
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pt-2">
                        <div className="space-y-4">
                          <div className="grid gap-2">
                            <span className="font-medium">Board Size</span>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm">Small</Button>
                              <Button variant="default" size="sm">Medium</Button>
                              <Button variant="outline" size="sm">Large</Button>
                            </div>
                          </div>
                          
                          <div className="grid gap-2">
                            <span className="font-medium">Board Style</span>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm">Classic</Button>
                              <Button variant="outline" size="sm">Minimal</Button>
                              <Button variant="default" size="sm">Modern</Button>
                            </div>
                          </div>
                          
                          <div className="grid gap-2">
                            <span className="font-medium">Board Color</span>
                            <input 
                              type="color" 
                              className="w-full h-10 rounded-md border border-input" 
                              defaultValue="#f3f4f6" 
                            />
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="game-pieces">
                      <AccordionTrigger className="text-lg font-medium">
                        <div className="flex items-center">
                          <SquareUser className="mr-2 h-4 w-4" />
                          Game Pieces
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pt-2">
                        <div className="space-y-4">
                          <div className="grid gap-2">
                            <span className="font-medium">X Style</span>
                            <div className="flex space-x-2">
                              <Button variant="default" size="sm">X</Button>
                              <Button variant="outline" size="sm">×</Button>
                              <Button variant="outline" size="sm">✕</Button>
                              <Button variant="outline" size="sm">❌</Button>
                            </div>
                          </div>
                          
                          <div className="grid gap-2">
                            <span className="font-medium">O Style</span>
                            <div className="flex space-x-2">
                              <Button variant="default" size="sm">O</Button>
                              <Button variant="outline" size="sm">○</Button>
                              <Button variant="outline" size="sm">◯</Button>
                              <Button variant="outline" size="sm">⭕</Button>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <span className="font-medium">X Color</span>
                              <input 
                                type="color" 
                                className="w-full h-10 mt-2 rounded-md border border-input" 
                                defaultValue="#ef4444" 
                              />
                            </div>
                            <div>
                              <span className="font-medium">O Color</span>
                              <input 
                                type="color" 
                                className="w-full h-10 mt-2 rounded-md border border-input" 
                                defaultValue="#3b82f6" 
                              />
                            </div>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              )}

              {/* Audio Section */}
              {activeTab === "audio" && (
                <div className="space-y-6">
                  <div className="flex items-center space-x-2">
                    <Volume2 className="h-5 w-5" />
                    <h2 className="text-2xl font-semibold">Audio</h2>
                  </div>
                  
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="sound">
                      <AccordionTrigger className="text-lg font-medium">
                        <div className="flex items-center">
                          <Music className="mr-2 h-4 w-4" />
                          Sound
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pt-2">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Enable Sound Effects</span>
                            <input type="checkbox" className="h-4 w-4" defaultChecked />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Enable Background Music</span>
                            <input type="checkbox" className="h-4 w-4" />
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="volume-control">
                      <AccordionTrigger className="text-lg font-medium">
                        <div className="flex items-center">
                          <Volume2 className="mr-2 h-4 w-4" />
                          Volume Control
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pt-2">
                        <div className="space-y-4">
                          <div className="grid gap-2">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">Master Volume</span>
                              <span>80%</span>
                            </div>
                            <input 
                              type="range" 
                              min="0" 
                              max="100" 
                              defaultValue="80" 
                              className="w-full" 
                            />
                          </div>
                          
                          <div className="grid gap-2">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">Sound Effects</span>
                              <span>90%</span>
                            </div>
                            <input 
                              type="range" 
                              min="0" 
                              max="100" 
                              defaultValue="90" 
                              className="w-full" 
                            />
                          </div>
                          
                          <div className="grid gap-2">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">Background Music</span>
                              <span>60%</span>
                            </div>
                            <input 
                              type="range" 
                              min="0" 
                              max="100" 
                              defaultValue="60" 
                              className="w-full" 
                            />
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="sound-options">
                      <AccordionTrigger className="text-lg font-medium">
                        <div className="flex items-center">
                          <VolumeX className="mr-2 h-4 w-4" />
                          Sound Options
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pt-2">
                        <div className="space-y-4">
                          <div className="grid gap-2">
                            <span className="font-medium">Sound Theme</span>
                            <select 
                              className="w-full p-2 rounded-md border border-input bg-background"
                            >
                              <option value="classic">Classic</option>
                              <option value="modern">Modern</option>
                              <option value="retro">Retro</option>
                              <option value="minimal">Minimal</option>
                            </select>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Mute When Tab is Inactive</span>
                            <input type="checkbox" className="h-4 w-4" defaultChecked />
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              )}

              {/* Accessibility Section */}
              {activeTab === "accessibility" && (
                <div className="space-y-6">
                  <div className="flex items-center space-x-2">
                    <Accessibility className="h-5 w-5" />
                    <h2 className="text-2xl font-semibold">Accessibility</h2>
                  </div>
                  
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="visible-accessibility">
                      <AccordionTrigger className="text-lg font-medium">
                        <div className="flex items-center">
                          <Monitor className="mr-2 h-4 w-4" />
                          Visible Accessibility
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pt-2">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">High Contrast Mode</span>
                            <input type="checkbox" className="h-4 w-4" />
                          </div>
                          
                          <div className="grid gap-2">
                            <span className="font-medium">Text Size</span>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm">Small</Button>
                              <Button variant="default" size="sm">Medium</Button>
                              <Button variant="outline" size="sm">Large</Button>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Reduce Animations</span>
                            <input type="checkbox" className="h-4 w-4" />
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="auditory-accessibility">
                      <AccordionTrigger className="text-lg font-medium">
                        <div className="flex items-center">
                          <Ear className="mr-2 h-4 w-4" />
                          Auditory Accessibility
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pt-2">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Screen Reader Support</span>
                            <input type="checkbox" className="h-4 w-4" defaultChecked />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Audio Cues for Game Events</span>
                            <input type="checkbox" className="h-4 w-4" defaultChecked />
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="motor-accessibility">
                      <AccordionTrigger className="text-lg font-medium">
                        <div className="flex items-center">
                          <LayoutGrid className="mr-2 h-4 w-4" />
                          Motor Accessibility
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pt-2">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Keyboard Navigation</span>
                            <input type="checkbox" className="h-4 w-4" defaultChecked />
                          </div>
                          
                          <div className="grid gap-2">
                            <span className="font-medium">Input Method</span>
                            <select 
                              className="w-full p-2 rounded-md border border-input bg-background"
                            >
                              <option value="touch">Touch/Mouse</option>
                              <option value="keyboard">Keyboard Only</option>
                              <option value="both">Both</option>
                            </select>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="cognitive-accessibility">
                      <AccordionTrigger className="text-lg font-medium">
                        <div className="flex items-center">
                          <BrainCircuit className="mr-2 h-4 w-4" />
                          Cognitive Accessibility
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pt-2">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Simple Mode</span>
                            <input type="checkbox" className="h-4 w-4" />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Hint System</span>
                            <input type="checkbox" className="h-4 w-4" defaultChecked />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Extended Time Limits</span>
                            <input type="checkbox" className="h-4 w-4" />
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              )}

              {/* Account Section */}
              {activeTab === "account" && (
                <div className="space-y-6">
                  <div className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <h2 className="text-2xl font-semibold">Account</h2>
                  </div>
                  
                  <Accordion type="single" collapsible className="w-full">
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
                  </Accordion>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
