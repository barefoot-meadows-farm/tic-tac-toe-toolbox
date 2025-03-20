
import { Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ThemeSettings = () => {
  return (
    <div className="border rounded-lg p-4">
      <div className="mb-4">
        <div className="flex items-center mb-1">
          <Palette className="mr-2 h-4 w-4" />
          <h3 className="text-lg font-medium">Theme</h3>
        </div>
        <p className="text-sm text-muted-foreground">Change the overall look and feel of the application.</p>
      </div>
      
      <div className="space-y-4">
        <div className="grid gap-2">
          <span className="font-medium">Color Theme</span>
          <p className="text-xs text-muted-foreground">Select a color palette for the application interface.</p>
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
          <div>
            <span className="font-medium">Dark Mode</span>
            <p className="text-xs text-muted-foreground">Switch between light and dark color schemes.</p>
          </div>
          <input type="checkbox" className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
};

export default ThemeSettings;
