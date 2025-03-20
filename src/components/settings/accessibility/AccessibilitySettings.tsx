
import { Accessibility } from 'lucide-react';
import { Accordion } from "@/components/ui/accordion";
import VisibleAccessibilitySettings from './VisibleAccessibilitySettings';
import AuditoryAccessibilitySettings from './AuditoryAccessibilitySettings';
import MotorAccessibilitySettings from './MotorAccessibilitySettings';
import CognitiveAccessibilitySettings from './CognitiveAccessibilitySettings';

const AccessibilitySettings = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Accessibility className="h-5 w-5" />
        <h2 className="text-2xl font-semibold">Accessibility</h2>
      </div>
      
      <Accordion type="single" collapsible className="w-full">
        <VisibleAccessibilitySettings />
        <AuditoryAccessibilitySettings />
        <MotorAccessibilitySettings />
        <CognitiveAccessibilitySettings />
      </Accordion>
    </div>
  );
};

export default AccessibilitySettings;
