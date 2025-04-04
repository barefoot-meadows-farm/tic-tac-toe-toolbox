
import React from 'react';
import AdsBanner from './AdsBanner';
import { useIsMobile } from '../hooks/use-mobile';

interface PageLayoutProps {
  children: React.ReactNode;
  hideAds?: boolean;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children, hideAds = false }) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow flex justify-center">
        {/* Left Ad Banner - only visible on desktop */}
        {!hideAds && !isMobile && (
          <div className="hidden lg:block lg:flex-shrink-0 w-[160px] sticky top-20 h-screen">
            <AdsBanner 
              adSlot="1234567890" 
              format="vertical" 
              className="sticky top-20 pt-4"
            />
          </div>
        )}
        
        {/* Main Content */}
        <div className="flex-grow max-w-7xl w-full">
          {children}
        </div>
        
        {/* Right Ad Banner - only visible on desktop */}
        {!hideAds && !isMobile && (
          <div className="hidden lg:block lg:flex-shrink-0 w-[160px] sticky top-20 h-screen">
            <AdsBanner 
              adSlot="0987654321" 
              format="vertical" 
              className="sticky top-20 pt-4"
            />
          </div>
        )}
      </div>
      
      {/* Mobile Ad Banner - only visible on mobile/tablet */}
      {!hideAds && isMobile && (
        <div className="lg:hidden w-full py-2">
          <AdsBanner 
            adSlot="5432167890" 
            format="rectangle" 
            className="mx-auto max-w-[336px] min-h-[280px]"
          />
        </div>
      )}
    </div>
  );
};

export default PageLayout;
