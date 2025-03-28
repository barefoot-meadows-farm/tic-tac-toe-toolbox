
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Plus } from 'lucide-react';
import AnimatedTransition from '@/components/AnimatedTransition';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

// Donation amounts with their corresponding Stripe URLs
// Note: These URLs should be replaced with actual Stripe payment links for each amount
const DONATION_OPTIONS = [
  { amount: 5, url: "https://buy.stripe.com/eVa3cc9CN99H2AgeUU" },
  { amount: 10, url: "https://buy.stripe.com/eVa9AA6qB2Ljgr6eUV" },
  { amount: 20, url: "https://buy.stripe.com/bIY6oobKV3Pn3Ek002" },
];

// Base URL for custom donations
const CUSTOM_DONATION_BASE_URL = "https://buy.stripe.com/test_bIYcODbOF8Rx0Za5kk?price=";

const Donate = () => {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [isCustomDialogOpen, setIsCustomDialogOpen] = useState(false);
  const [customAmount, setCustomAmount] = useState("");
  
  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
  };
  
  const handleDonateClick = (url: string) => {
    // Analytics tracking could be added here
    console.log(`Donating ${selectedAmount} dollars`);
    window.open(url, '_blank');
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers and decimal points
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setCustomAmount(value);
  };

  const handleCustomDonation = () => {
    if (!customAmount || parseFloat(customAmount) <= 0) return;
    
    // Convert to cents for Stripe
    const amountInCents = Math.round(parseFloat(customAmount) * 100);
    const url = `${CUSTOM_DONATION_BASE_URL}${amountInCents}`;
    
    window.open(url, '_blank');
    setIsCustomDialogOpen(false);
    setCustomAmount("");
  };
  
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-24 mt-12">
          <AnimatedTransition>
            <div className="max-w-3xl mx-auto">
              <div className="mb-8 text-center">
                <h1 className="text-3xl md:text-4xl font-bold mb-4">Support Tic Tac Toolbox</h1>
                <p className="text-lg text-muted-foreground">
                  Choose an amount to help support our ongoing development and keep Tic Tac Toolbox free for everyone.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {DONATION_OPTIONS.map((option) => (
                  <Card 
                    key={option.amount}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedAmount === option.amount ? 'ring-2 ring-primary bg-primary/5' : ''
                    }`}
                    onClick={() => handleAmountSelect(option.amount)}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="text-2xl font-bold mb-2">${option.amount}</div>
                    </CardContent>
                  </Card>
                ))}
                
                {/* Custom amount card */}
                <Card 
                  className="cursor-pointer transition-all hover:shadow-md"
                  onClick={() => setIsCustomDialogOpen(true)}
                >
                  <CardContent className="p-6 text-center">
                    <div className="text-2xl font-bold mb-2 flex items-center justify-center">
                      <Plus className="mr-1 h-5 w-5" />
                      Custom
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="flex justify-center">
                <Button
                  variant="default"
                  size="lg"
                  className="px-8 group"
                  disabled={!selectedAmount}
                  onClick={() => {
                    const option = DONATION_OPTIONS.find(o => o.amount === selectedAmount);
                    if (option) handleDonateClick(option.url);
                  }}
                >
                  <Heart className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform group-hover:fill-red-200" />
                  <span>{selectedAmount ? `Donate $${selectedAmount}` : 'Select an amount'}</span>
                </Button>
              </div>
            </div>
          </AnimatedTransition>
        </div>
      </main>
      
      {/* Custom donation dialog */}
      <Dialog open={isCustomDialogOpen} onOpenChange={setIsCustomDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enter Donation Amount</DialogTitle>
            <DialogDescription>
              Specify how much you would like to donate.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-end gap-2 py-4">
            <div className="flex-1">
              <div className="flex items-center">
                <span className="text-lg mr-2">$</span>
                <Input
                  type="text"
                  placeholder="Amount"
                  value={customAmount}
                  onChange={handleCustomAmountChange}
                  className="text-lg"
                />
              </div>
            </div>
            <Button onClick={handleCustomDonation} type="submit">
              <Heart className="mr-2 h-4 w-4" />
              Donate
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
};

export default Donate;
