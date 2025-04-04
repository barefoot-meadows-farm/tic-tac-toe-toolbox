
import React, { useEffect, useRef, useState } from 'react';
import { useIsMobile } from '../hooks/use-mobile';

interface AdsBannerProps {
  adSlot: string;
  format?: 'auto' | 'rectangle' | 'vertical';
  className?: string;
}

const AdsBanner: React.FC<AdsBannerProps> = ({ adSlot, format = 'auto', className }) => {
  const adContainerRef = useRef<HTMLDivElement>(null);
  const [adLoaded, setAdLoaded] = useState(false);
  const isMobile = useIsMobile();
  
  // Determine the minimum dimensions based on format
  const minWidth = format === 'vertical' ? '160px' : '300px';
  const minHeight = format === 'vertical' ? '600px' : '250px';

  useEffect(() => {
    // Function to initialize ads
    const initAd = () => {
      if (adContainerRef.current && window.adsbygoogle) {
        try {
          console.log("Initializing ad in slot:", adSlot);
          // @ts-ignore - adsbygoogle is loaded from the script in index.html
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          setAdLoaded(true);
        } catch (e) {
          console.error("AdSense error:", e);
        }
      }
    };

    // Wait for the container to be properly sized before initializing
    // This is crucial for AdSense to correctly determine the ad size
    if (adContainerRef.current) {
      // If we're in a browser environment, use ResizeObserver to detect when the ad container has a non-zero size
      if (typeof ResizeObserver !== 'undefined') {
        const resizeObserver = new ResizeObserver(entries => {
          const entry = entries[0];
          if (entry.contentRect.width > 0 && !adLoaded) {
            console.log("Ad container has width:", entry.contentRect.width);
            initAd();
            resizeObserver.disconnect(); // Only need to initialize once
          }
        });
        
        resizeObserver.observe(adContainerRef.current);
        return () => resizeObserver.disconnect();
      } else {
        // Fallback for browsers without ResizeObserver
        setTimeout(initAd, 500);
      }
    }
  }, [adSlot, adLoaded]);

  return (
    <div 
      className={className}
      ref={adContainerRef}
      style={{ 
        minWidth,
        minHeight,
        width: format === 'vertical' ? '160px' : '100%', 
        display: 'block'
      }}
    >
      <ins
        className="adsbygoogle"
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          minHeight: format === 'vertical' ? '600px' : '250px',
        }}
        data-ad-client="ca-pub-2109736348329514"
        data-ad-slot={adSlot}
        data-ad-format={format}
      />
    </div>
  );
};

export default AdsBanner;
