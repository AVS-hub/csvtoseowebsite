import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

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
      <header className="bg-white shadow-md">
        <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-blue-600">SiteGenie</div>
          <div className="hidden md:flex space-x-4">
            <button onClick={() => scrollToSection('features')} className="text-gray-600 hover:text-blue-600">Features</button>
            <button onClick={() => scrollToSection('how-it-works')} className="text-gray-600 hover:text-blue-600">How It Works</button>
            <button onClick={() => scrollToSection('pricing')} className="text-gray-600 hover:text-blue-600">Pricing</button>
            <Link to="/login" className="text-gray-600 hover:text-blue-600">Login</Link>
            <Link to="/signup" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Sign Up</Link>
          </div>
          <button className="md:hidden" onClick={toggleMobileMenu}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
        </nav>
        {showMobileMenu && (
          <div className="md:hidden bg-white py-2">
            <button onClick={() => scrollToSection('features')} className="block w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-100">Features</button>
            <button onClick={() => scrollToSection('how-it-works')} className="block w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-100">How It Works</button>
            <button onClick={() => scrollToSection('pricing')} className="block w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-100">Pricing</button>
            <Link to="/login" className="block w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-100">Login</Link>
            <Link to="/signup" className="block w-full text-left px-4 py-2 text-blue-600 hover:bg-gray-100">Sign Up</Link>
          </div>
        )}
      </header>

      <main>
        <section className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">Create Your Dream Website with AI</h1>
            <p className="text-xl mb-8">SiteGenie uses advanced AI to build beautiful, SEO-optimized websites in minutes.</p>
            <Link to="/signup" className="bg-white text-blue-600 px-8 py-3 rounded-full text-lg font-semibold hover:bg-gray-100 transition duration-300">Get Started for Free</Link>
          </div>
        </section>

        <section id="features" className="py-20 bg-gray-100">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature) => (
                <div key={feature.id} className="bg-white p-6 rounded-lg shadow-md">
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
              <div className="text-center">
                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mb-4 mx-auto">
                  <span className="text-blue-600 text-2xl font-bold">1</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Input Your Info</h3>
                <p className="text-gray-600">Provide basic details about your website</p>
              </div>
              <div className="text-center">
                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mb-4 mx-auto">
                  <span className="text-blue-600 text-2xl font-bold">2</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">AI Generation</h3>
                <p className="text-gray-600">Our AI creates your website content</p>
              </div>
              <div className="text-center">
                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mb-4 mx-auto">
                  <span className="text-blue-600 text-2xl font-bold">3</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Customize</h3>
                <p className="text-gray-600">Refine and personalize your site</p>
              </div>
              <div className="text-center">
                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mb-4 mx-auto">
                  <span className="text-blue-600 text-2xl font-bold">4</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Launch</h3>
                <p className="text-gray-600">Publish your new website to the world</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-gray-100">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">What Our Customers Say</h2>
            <div className="max-w-2xl mx-auto">
              <div className="bg-white p-8 rounded-lg shadow-md">
                <p className="text-gray-600 mb-4">{testimonials[activeTestimonial].content}</p>
                <div className="font-semibold">{testimonials[activeTestimonial].name}</div>
                <div className="text-gray-500">{testimonials[activeTestimonial].role}</div>
              </div>
              <div className="flex justify-center mt-4 space-x-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveTestimonial(index)}
                    className={`w-3 h-3 rounded-full ${index === activeTestimonial ? 'bg-blue-600' : 'bg-gray-300'}`}
                    aria-label={`Go to testimonial ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="pricing" className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Simple, Transparent Pricing</h2>
            <div className="flex justify-center mb-8">
              <button
                onClick={changePricingPlan}
                className="bg-gray-200 px-4 py-2 rounded-full"
              >
                <span className={`mr-2 ${pricingPlan === 'monthly' ? 'text-blue-600 font-semibold' : 'text-gray-600'}`}>Monthly</span>
                <span className={pricingPlan === 'annual' ? 'text-blue-600 font-semibold' : 'text-gray-600'}>Annual</span>
              </button>
            </div>
            <div className="flex flex-col md:flex-row justify-center space-y-8 md:space-y-0 md:space-x-8">
              <div className="bg-white p-8 rounded-lg shadow-md max-w-sm w-full">
                <h3 className="text-2xl font-bold mb-4">Basic</h3>
                <div className="text-4xl font-bold mb-4">
                  {pricingPlan === 'monthly' ? '$19' : '$190'}
                  <span className="text-base font-normal text-gray-500">/{pricingPlan === 'monthly' ? 'mo' : 'yr'}</span>
                </div>
                <ul className="mb-8 space-y-2">
                  <li>✅ 5 AI-generated pages</li>
                  <li>✅ Basic SEO optimization</li>
                  <li>✅ Mobile-responsive design</li>
                </ul>
                <Link to="/signup" className="block text-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Get Started</Link>
              </div>
              <div className="bg-white p-8 rounded-lg shadow-md max-w-sm w-full border-2 border-blue-600">
                <h3 className="text-2xl font-bold mb-4">Pro</h3>
                <div className="text-4xl font-bold mb-4">
                  {pricingPlan === 'monthly' ? '$49' : '$490'}
                  <span className="text-base font-normal text-gray-500">/{pricingPlan === 'monthly' ? 'mo' : 'yr'}</span>
                </div>
                <ul className="mb-8 space-y-2">
                  <li>✅ 20 AI-generated pages</li>
                  <li>✅ Advanced SEO optimization</li>
                  <li>✅ Custom domain</li>
                  <li>✅ Priority support</li>
                </ul>
                <Link to="/signup" className="block text-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Get Started</Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-gray-100">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
            <div className="max-w-2xl mx-auto">
              {faqItems.map((item) => (
                <div key={item.id} className="mb-6">
                  <h3 className="text-xl font-semibold mb-2">{item.question}</h3>
                  <p className="text-gray-600">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-blue-600 text-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8">Stay Updated</h2>
            <p className="text-center mb-8">Subscribe to our newsletter for the latest updates and tips.</p>
            <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto">
              <div className="flex">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-grow px-4 py-2 rounded-l-md text-gray-900"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button
                  type="submit"
                  className="bg-white text-blue-600 px-6 py-2 rounded-r-md font-semibold hover:bg-gray-100 transition duration-300"
                  disabled={isEmailSubmitting}
                >
                  {isEmailSubmitting ? 'Subscribing...' : 'Subscribe'}
                </button>
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