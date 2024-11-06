import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ChevronRight, ChevronLeft, Menu, X, Check } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toggle } from "@/components/ui/toggle";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const UV_Landing: React.FC = () => {
  const [showMobileMenu, setShowMobileMenu] = useState<boolean>(false);
  const [activeTestimonial, setActiveTestimonial] = useState<number>(0);
  const [pricingPlan, setPricingPlan] = useState<'monthly' | 'annual'>('monthly');
  const [email, setEmail] = useState<string>('');
  const [isEmailSubmitting, setIsEmailSubmitting] = useState<boolean>(false);
  const [emailSubmissionStatus, setEmailSubmissionStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const testimonials = [
    { id: 1, name: 'John Doe', role: 'Small Business Owner', content: 'SiteGenie transformed my online presence. It\'s incredibly easy to use and the AI-generated content is spot-on!' },
    { id: 2, name: 'Jane Smith', role: 'Digital Marketer', content: 'The SEO optimization features are a game-changer. My clients\' websites are ranking higher than ever!' },
    { id: 3, name: 'Mike Johnson', role: 'Blogger', content: 'I was able to create a professional-looking blog in minutes. SiteGenie is a true time-saver!' },
  ];

  const features = [
    { id: 1, title: 'AI-Powered Content Creation', description: 'Generate high-quality, SEO-optimized content with a single click.' },
    { id: 2, title: 'Responsive Design', description: 'Your website looks great on all devices, from mobile to desktop.' },
    { id: 3, title: 'SEO Optimization', description: 'Built-in tools to help your site rank higher in search results.' },
    { id: 4, title: 'Easy Customization', description: 'Tailor your site\'s look and feel without any coding knowledge.' },
  ];

  const faqItems = [
    { id: 1, question: 'How does SiteGenie work?', answer: 'SiteGenie uses advanced AI to generate website content based on your input. Simply provide some basic information, and our AI will create a fully-functional website for you.' },
    { id: 2, question: 'Do I need coding skills to use SiteGenie?', answer: 'Not at all! SiteGenie is designed for users of all skill levels. Our intuitive interface allows you to create and customize your website without any coding knowledge.' },
    { id: 3, question: 'Can I export my website?', answer: 'Yes, you can export your website as HTML files, which you can then host on any web server of your choice.' },
  ];

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setShowMobileMenu(false);
  };

  const cycleTestimonials = useCallback(() => {
    setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
  }, [testimonials.length]);

  useEffect(() => {
    const interval = setInterval(cycleTestimonials, 5000);
    return () => clearInterval(interval);
  }, [cycleTestimonials]);

  const changePricingPlan = () => {
    setPricingPlan((prev) => (prev === 'monthly' ? 'annual' : 'monthly'));
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsEmailSubmitting(true);
    setEmailSubmissionStatus('idle');

    try {
      await axios.post('http://localhost:1337/api/newsletter/subscribe', { email });
      setEmailSubmissionStatus('success');
      setEmail('');
    } catch (error) {
      setEmailSubmissionStatus('error');
    } finally {
      setIsEmailSubmitting(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 bg-white shadow-md z-50">
        <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-blue-600">SiteGenie</div>
          <div className="hidden md:flex space-x-6">
            <Button variant="ghost" onClick={() => scrollToSection('features')}>Features</Button>
            <Button variant="ghost" onClick={() => scrollToSection('how-it-works')}>How It Works</Button>
            <Button variant="ghost" onClick={() => scrollToSection('pricing')}>Pricing</Button>
            <Button variant="outline" asChild><Link to="/login">Login</Link></Button>
            <Button asChild><Link to="/signup">Sign Up</Link></Button>
          </div>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleMobileMenu}>
            {showMobileMenu ? <X /> : <Menu />}
          </Button>
        </nav>
        {showMobileMenu && (
          <div className="md:hidden bg-white py-2 px-4 space-y-2">
            <Button variant="ghost" className="w-full justify-start" onClick={() => scrollToSection('features')}>Features</Button>
            <Button variant="ghost" className="w-full justify-start" onClick={() => scrollToSection('how-it-works')}>How It Works</Button>
            <Button variant="ghost" className="w-full justify-start" onClick={() => scrollToSection('pricing')}>Pricing</Button>
            <Button variant="outline" className="w-full" asChild><Link to="/login">Login</Link></Button>
            <Button className="w-full" asChild><Link to="/signup">Sign Up</Link></Button>
          </div>
        )}
      </header>

      <main>
        <section className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-20">
          <div className="container mx-auto px-4 flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h1 className="text-4xl md:text-6xl font-bold mb-4">Create Your Dream Website with AI</h1>
              <p className="text-xl mb-8">SiteGenie uses advanced AI to build beautiful, SEO-optimized websites in minutes.</p>
              <Button size="lg" asChild>
                <Link to="/signup">Get Started for Free</Link>
              </Button>
            </div>
            <div className="md:w-1/2">
              <img src="https://picsum.photos/seed/sitegenie/600/400" alt="AI Website Builder" className="rounded-lg shadow-xl" />
            </div>
          </div>
        </section>

        <section id="features" className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature) => (
                <div key={feature.id} className="bg-white p-6 rounded-lg shadow-md transition-transform hover:scale-105">
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
            <div className="flex flex-col md:flex-row justify-center items-center space-y-8 md:space-y-0 md:space-x-8">
              {[
                { step: 1, title: "Input Your Info", description: "Provide basic details about your website" },
                { step: 2, title: "AI Generation", description: "Our AI creates your website content" },
                { step: 3, title: "Customize", description: "Refine and personalize your site" },
                { step: 4, title: "Launch", description: "Publish your new website to the world" }
              ].map((item) => (
                <div key={item.step} className="text-center">
                  <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mb-4 mx-auto">
                    <span className="text-blue-600 text-2xl font-bold">{item.step}</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">What Our Customers Say</h2>
            <Carousel className="max-w-2xl mx-auto">
              <CarouselContent>
                {testimonials.map((testimonial, index) => (
                  <CarouselItem key={testimonial.id}>
                    <div className="bg-white p-8 rounded-lg shadow-md">
                      <p className="text-gray-600 mb-4">{testimonial.content}</p>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-gray-500">{testimonial.role}</div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
        </section>

        <section id="pricing" className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Simple, Transparent Pricing</h2>
            <div className="flex justify-center mb-8">
              <Toggle pressed={pricingPlan === 'annual'} onPressedChange={changePricingPlan}>
                <span className={pricingPlan === 'monthly' ? 'font-semibold' : ''}>Monthly</span>
                <span className="mx-2">|</span>
                <span className={pricingPlan === 'annual' ? 'font-semibold' : ''}>Annual</span>
              </Toggle>
            </div>
            <div className="flex flex-col md:flex-row justify-center space-y-8 md:space-y-0 md:space-x-8">
              {[
                { title: "Basic", price: pricingPlan === 'monthly' ? '$19' : '$190', features: ["5 AI-generated pages", "Basic SEO optimization", "Mobile-responsive design"] },
                { title: "Pro", price: pricingPlan === 'monthly' ? '$49' : '$490', features: ["20 AI-generated pages", "Advanced SEO optimization", "Custom domain", "Priority support"] }
              ].map((plan, index) => (
                <div key={plan.title} className={`bg-white p-8 rounded-lg shadow-md max-w-sm w-full ${index === 1 ? 'border-2 border-blue-600' : ''}`}>
                  <h3 className="text-2xl font-bold mb-4">{plan.title}</h3>
                  <div className="text-4xl font-bold mb-4">
                    {plan.price}
                    <span className="text-base font-normal text-gray-500">/{pricingPlan === 'monthly' ? 'mo' : 'yr'}</span>
                  </div>
                  <ul className="mb-8 space-y-2">
                    {plan.features.map((feature, i) => (
                      <li key={i}><Check className="inline mr-2 text-green-500" size={16} /> {feature}</li>
                    ))}
                  </ul>
                  <Button className="w-full" asChild><Link to="/signup">Get Started</Link></Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="max-w-2xl mx-auto">
              {faqItems.map((item) => (
                <AccordionItem key={item.id} value={`item-${item.id}`}>
                  <AccordionTrigger>{item.question}</AccordionTrigger>
                  <AccordionContent>{item.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        <section className="py-20 bg-blue-600 text-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8">Stay Updated</h2>
            <p className="text-center mb-8">Subscribe to our newsletter for the latest updates and tips.</p>
            <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto">
              <div className="flex">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-grow rounded-r-none"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Button type="submit" className="rounded-l-none" disabled={isEmailSubmitting}>
                  {isEmailSubmitting ? 'Subscribing...' : 'Subscribe'}
                </Button>
              </div>
              {emailSubmissionStatus === 'success' && (
                <p className="text-green-300 mt-2">Thank you for subscribing!</p>
              )}
              {emailSubmissionStatus === 'error' && (
                <p className="text-red-300 mt-2">An error occurred. Please try again.</p>
              )}
            </form>
          </div>
        </section>
      </main>

      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-2xl font-bold mb-4 md:mb-0">SiteGenie</div>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-blue-400">Terms of Service</a>
              <a href="#" className="hover:text-blue-400">Privacy Policy</a>
              <a href="#" className="hover:text-blue-400">Contact Us</a>
            </div>
          </div>
          <div className="mt-8 text-center text-gray-400">
            © 2023 SiteGenie. All rights reserved.
          </div>
        </div>
      </footer>
    </>
  );
};

export default UV_Landing;