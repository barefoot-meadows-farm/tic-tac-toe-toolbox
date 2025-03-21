
import React, { createContext, useContext, useState, useEffect } from 'react';

interface PaywallContextType {
  paywallEnabled: boolean;
  togglePaywall: () => void;
}

const PaywallContext = createContext<PaywallContextType | undefined>(undefined);

export const PaywallProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [paywallEnabled, setPaywallEnabled] = useState<boolean>(true);

  // Load from localStorage on initial render
  useEffect(() => {
    const storedValue = localStorage.getItem('paywallEnabled');
    if (storedValue !== null) {
      setPaywallEnabled(storedValue === 'true');
    }
  }, []);

  const togglePaywall = () => {
    const newValue = !paywallEnabled;
    setPaywallEnabled(newValue);
    localStorage.setItem('paywallEnabled', String(newValue));
  };

  return (
    <PaywallContext.Provider value={{ paywallEnabled, togglePaywall }}>
      {children}
    </PaywallContext.Provider>
  );
};

export const usePaywall = (): PaywallContextType => {
  const context = useContext(PaywallContext);
  if (context === undefined) {
    throw new Error('usePaywall must be used within a PaywallProvider');
  }
  return context;
};
