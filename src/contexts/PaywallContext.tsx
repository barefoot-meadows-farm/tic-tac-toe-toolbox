
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

type PaywallContextType = {
  paywallEnabled: boolean;
  togglePaywall: () => void;
};

const PaywallContext = createContext<PaywallContextType | undefined>(undefined);

export const PaywallProvider = ({ children }: { children: ReactNode }) => {
  const [paywallEnabled, setPaywallEnabled] = useState(true);
  const { user, isPremium } = useAuth();
  
  // Disable paywall for premium users
  useEffect(() => {
    if (isPremium) {
      setPaywallEnabled(false);
    }
  }, [isPremium]);
  
  const togglePaywall = () => {
    setPaywallEnabled(!paywallEnabled);
  };
  
  return (
    <PaywallContext.Provider
      value={{
        paywallEnabled: isPremium ? false : paywallEnabled,
        togglePaywall,
      }}
    >
      {children}
    </PaywallContext.Provider>
  );
};

export const usePaywall = () => {
  const context = useContext(PaywallContext);
  if (context === undefined) {
    throw new Error('usePaywall must be used within a PaywallProvider');
  }
  return context;
};
