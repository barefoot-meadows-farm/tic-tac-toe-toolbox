
import { Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';

const LanguageSettings = () => {
  return (
    <div className="border rounded-lg p-4">
      <div className="mb-4">
        <div className="flex items-center mb-1">
          <Languages className="mr-2 h-4 w-4" />
          <h3 className="text-lg font-medium">Language</h3>
        </div>
        <p className="text-sm text-muted-foreground">Choose your preferred language for the application.</p>
      </div>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <Button variant="default" size="sm">English</Button>
          <Button variant="outline" size="sm">Español</Button>
          <Button variant="outline" size="sm">Français</Button>
          <Button variant="outline" size="sm">Deutsch</Button>
          <Button variant="outline" size="sm">日本語</Button>
          <Button variant="outline" size="sm">中文</Button>
        </div>
      </div>
    </div>
  );
};

export default LanguageSettings;
