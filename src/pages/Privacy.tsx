
import AnimatedTransition from '@/components/AnimatedTransition';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Privacy = () => {
  const lastUpdated = "October 15, 2023";
  
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-24 pt-32">
          <AnimatedTransition>
            <div className="max-w-3xl mx-auto">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Privacy Policy</h1>
              <p className="text-muted-foreground mb-6">Last Updated: {lastUpdated}</p>
              
              <div className="prose prose-lg dark:prose-invert">
                <p className="mb-4">
                  At Tic Tac Toolbox, we respect your privacy and are committed to protecting it. This Privacy Policy explains how we collect, use, and safeguard your information when you visit our website.
                </p>
                
                <h2 className="text-2xl font-bold mt-8 mb-4">Information We Collect</h2>
                
                <h3 className="text-xl font-semibold mt-6 mb-3">Personal Information</h3>
                <p className="mb-4">
                  We may collect personal information that you voluntarily provide to us when you:
                </p>
                <ul className="list-disc pl-8 mb-4">
                  <li>Create an account</li>
                  <li>Make a donation</li>
                  <li>Contact us through our contact form</li>
                </ul>
                
                <h3 className="text-xl font-semibold mt-6 mb-3">Usage Data</h3>
                <p className="mb-4">
                  We may automatically collect certain information about how you interact with our website, including:
                </p>
                <ul className="list-disc pl-8 mb-4">
                  <li>IP address</li>
                  <li>Browser type</li>
                  <li>Pages visited</li>
                  <li>Time spent on pages</li>
                  <li>Referring website</li>
                </ul>
                
                <h2 className="text-2xl font-bold mt-8 mb-4">How We Use Your Information</h2>
                <p className="mb-4">
                  We use the information we collect to:
                </p>
                <ul className="list-disc pl-8 mb-4">
                  <li>Provide, maintain, and improve our services</li>
                  <li>Process donations</li>
                  <li>Respond to your inquiries</li>
                  <li>Monitor and analyze usage patterns</li>
                  <li>Prevent fraudulent activities</li>
                </ul>
                
                <h2 className="text-2xl font-bold mt-8 mb-4">Third-Party Services</h2>
                <p className="mb-4">
                  We may use third-party services that collect, monitor, and analyze user data:
                </p>
                <ul className="list-disc pl-8 mb-4">
                  <li><strong>Stripe:</strong> For processing donations. When you make a donation, your payment information is collected and processed directly by Stripe. Please review Stripe's privacy policy for more information.</li>
                  <li><strong>Google Analytics:</strong> For website analytics. This service uses cookies to track user interactions and generate reports about website usage.</li>
                </ul>
                
                <h2 className="text-2xl font-bold mt-8 mb-4">Your Rights</h2>
                <p className="mb-4">
                  Depending on your location, you may have certain rights regarding your personal information, including:
                </p>
                <ul className="list-disc pl-8 mb-4">
                  <li>The right to access personal information we hold about you</li>
                  <li>The right to request correction of inaccurate information</li>
                  <li>The right to request deletion of your information</li>
                  <li>The right to object to processing of your information</li>
                  <li>The right to data portability</li>
                </ul>
                
                <h2 className="text-2xl font-bold mt-8 mb-4">Changes to This Privacy Policy</h2>
                <p className="mb-4">
                  We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
                </p>
                
                <h2 className="text-2xl font-bold mt-8 mb-4">Contact Us</h2>
                <p className="mb-4">
                  If you have any questions about this Privacy Policy, please <a href="/contact" className="text-primary hover:underline">contact us</a>.
                </p>
              </div>
            </div>
          </AnimatedTransition>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Privacy;
