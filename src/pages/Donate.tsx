
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import AnimatedTransition from '@/components/AnimatedTransition';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// Donation amounts with their corresponding Stripe URLs
// Note: These URLs should be replaced with actual Stripe payment links for each amount
const DONATION_OPTIONS = [
  { amount: 5, url: "https://buy.stripe.com/test_bIYcODbOF8Rx0Za5kk?price=500" },
  { amount: 10, url: "https://buy.stripe.com/test_bIYcODbOF8Rx0Za5kk?price=1000" },
  { amount: 20, url: "https://buy.stripe.com/test_bIYcODbOF8Rx0Za5kk?price=2000" },
  { amount: 50, url: "https://buy.stripe.com/test_bIYcODbOF8Rx0Za5kk?price=5000" },
  { amount: 100, url: "https://buy.stripe.com/test_bIYcODbOF8Rx0Za5kk?price=10000" },
];

const Donate = () => {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  
  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
  };
  
  const handleDonateClick = (url: string) => {
    // Analytics tracking could be added here
    console.log(`Donating ${selectedAmount} dollars`);
    window.open(url, '_blank');
  };
  
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-12">
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
                      <div className="text-sm text-muted-foreground">
                        {option.amount === 5 && "Coffee supporter"}
                        {option.amount === 10 && "Bronze supporter"}
                        {option.amount === 20 && "Silver supporter"}
                        {option.amount === 50 && "Gold supporter"}
                        {option.amount === 100 && "Platinum supporter"}
                      </div>
                    </CardContent>
                  </Card>
                ))}
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
      
      <Footer />
    </div>
  );
};

export default Donate;
