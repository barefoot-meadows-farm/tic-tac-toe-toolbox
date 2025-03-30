
import AnimatedTransition from '@/components/AnimatedTransition';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const About = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-24 pt-32">
          <AnimatedTransition>
            <div className="max-w-3xl mx-auto">
              <h1 className="text-3xl md:text-4xl font-bold mb-6">About Tic Tac Toolbox</h1>
              
              <div className="prose prose-lg dark:prose-invert">
                <p className="text-lg mb-4">
                  Tic Tac Toolbox is a curated collection of unique and engaging variations of the classic Tic-Tac-Toe game.
                </p>
                
                <p className="text-lg mb-4">
                  Our mission is to bring joy and strategic thinking through simple yet captivating game mechanics.
                  We believe that even the most basic games can provide endless fun when approached with creativity.
                </p>
                
                <p className="text-lg mb-4">
                  Each variant in our collection has been carefully designed to offer a fresh perspective on the 
                  traditional game, challenging players of all ages to think differently and develop new strategies.
                </p>
                
                <h2 className="text-2xl font-bold mt-8 mb-4">Our Story</h2>
                
                <p className="text-lg mb-4">
                  Tic Tac Toolbox began as a passion project to explore the mathematical and strategic depths 
                  of simple grid-based games. What started as an experiment quickly grew into a comprehensive 
                  collection that showcases the surprising complexity that can emerge from simple rule modifications.
                </p>
                
                <p className="text-lg">
                  We're constantly working to expand our collection with new and interesting variants.
                  Have a suggestion for a game? We'd love to hear from you through our <a href="/contact" className="text-primary hover:underline">Contact page</a>.
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

export default About;
