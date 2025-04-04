
import React, { useEffect, useRef } from 'react';

interface AdsBannerProps {
  adSlot: string;
  format?: 'auto' | 'rectangle' | 'vertical';
  className?: string;
}

const AdsBanner: React.FC<AdsBannerProps> = ({ adSlot, format = 'auto', className }) => {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (adRef.current && window.adsbygoogle) {
      try {
        // @ts-ignore - adsbygoogle is loaded from the script in index.html
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.error("AdSense error:", e);
      }
    }
  }, []);

  return (
    <div className={className}>
      <ins
        className="adsbygoogle"
        style={{
          display: 'block',
          minHeight: format === 'vertical' ? '600px' : '250px',
          width: format === 'vertical' ? '160px' : '100%',
        }}
        data-ad-client="ca-pub-2109736348329514"
        data-ad-slot={adSlot}
        data-ad-format={format}
        ref={adRef}
      />
    </div>
  );
};

export default AdsBanner;
