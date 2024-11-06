import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FaBars, FaTimes, FaCheck, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import axios from 'axios';

const UV_Landing: React.FC = () => {
  const [showMobileMenu, setShowMobileMenu] = useState<boolean>(false);
  const [activeTestimonial, setActiveTestimonial] = useState<number>(0);
  const [pricingPlan, setPricingPlan] = useState<'monthly' | 'annual'>('monthly');
  const [showSignupModal, setShowSignupModal] = useState<boolean>(false);
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitMessage, setSubmitMessage] = useState<string>('');

  const testimonials = [
    { id: 1, name: 'John Doe', role: 'Small Business Owner', content: 'SiteGenie transformed my online presence. It\'s incredibly easy to use and the results are amazing!' },
    { id: 2, name: 'Jane Smith', role: 'Digital Marketer', content: 'As a marketer, I appreciate the SEO features. SiteGenie has significantly improved our clients\' search rankings.' },
    { id: 3, name: 'Mike Johnson', role: 'Freelance Writer', content: 'SiteGenie allowed me to create a professional portfolio website in no time. Highly recommended!' },
  ];

  const toggleMobileMenu = () => setShowMobileMenu(!showMobileMenu);

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
    setShowMobileMenu(false);
  };

  const changePricingPlan = () => {
    setPricingPlan(pricingPlan === 'monthly' ? 'annual' : 'monthly');
  };

  const cycleTestimonials = useCallback((direction: 'next' | 'prev') => {
    setActiveTestimonial((prev) => {
      if (direction === 'next') {
        return (prev + 1) % testimonials.length;
      } else {
        return prev === 0 ? testimonials.length - 1 : prev - 1;
      }
    });
  }, [testimonials.length]);

  useEffect(() => {
    const interval = setInterval(() => {
      cycleTestimonials('next');
    }, 5000);
    return () => clearInterval(interval);
  }, [cycleTestimonials]);

  const openSignupModal = (plan: string) => {
    setSelectedPlan(plan);
    setShowSignupModal(true);
  };

  const submitNewsletterSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      await axios.post('http://localhost:1337/api/newsletter/signup', { email });
      setSubmitMessage('Thank you for subscribing!');
      setEmail('');
    } catch (error) {
      setSubmitMessage('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <header className="bg-white shadow-md fixed top-0 left-0 right-0 z-50">
        <nav className="container mx-auto px-6 py-3">
          <div className="flex justify-between items-center">
            <div className="text-xl font-bold text-gray-800">SiteGenie</div>
            <div className="hidden md:flex space-x-4">
              <button onClick={() => scrollToSection('features')} className="text-gray-600 hover:text-gray-800">Features</button>
              <button onClick={() => scrollToSection('how-it-works')} className="text-gray-600 hover:text-gray-800">How It Works</button>
              <button onClick={() => scrollToSection('pricing')} className="text-gray-600 hover:text-gray-800">Pricing</button>
              <Link to="/login" className="text-blue-600 hover:text-blue-800">Login</Link>
              <Link to="/signup" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Sign Up</Link>
            </div>
            <button className="md:hidden" onClick={toggleMobileMenu}>
              {showMobileMenu ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </nav>
        {showMobileMenu && (
          <div className="md:hidden bg-white py-2">
            <button onClick={() => scrollToSection('features')} className="block w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-100">Features</button>
            <button onClick={() => scrollToSection('how-it-works')} className="block w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-100">How It Works</button>
            <button onClick={() => scrollToSection('pricing')} className="block w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-100">Pricing</button>
            <Link to="/login" className="block w-full text-left px-4 py-2 text-blue-600 hover:bg-gray-100">Login</Link>
            <Link to="/signup" className="block w-full text-left px-4 py-2 text-blue-600 hover:bg-gray-100">Sign Up</Link>
          </div>
        )}
      </header>

      <main className="pt-16">
        <section className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-20">
          <div className="container mx-auto px-6 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">Create Your Dream Website in Minutes</h1>
            <p className="text-xl mb-8">SiteGenie uses AI to transform your ideas into stunning, SEO-optimized websites.</p>
            <Link to="/signup" className="bg-white text-blue-600 px-8 py-3 rounded-full text-lg font-semibold hover:bg-gray-100 transition duration-300">Get Started for Free</Link>
          </div>
        </section>

        <section id="features" className="py-20 bg-gray-100">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-12">Powerful Features</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-4">AI-Powered Content</h3>
                <p>Generate high-quality, SEO-optimized content with just a few clicks.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-4">Responsive Design</h3>
                <p>Create websites that look great on all devices, from mobile to desktop.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-4">SEO Optimization</h3>
                <p>Boost your search engine rankings with built-in SEO tools and suggestions.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="py-20">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
            <div className="flex flex-col md:flex-row justify-center items-center space-y-8 md:space-y-0 md:space-x-8">
              <div className="text-center">
                <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">1</div>
                <h3 className="text-xl font-semibold mb-2">Upload Your CSV</h3>
                <p>Provide your page structure and basic content ideas.</p>
              </div>
              <div className="text-center">
                <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">2</div>
                <h3 className="text-xl font-semibold mb-2">AI Generation</h3>
                <p>Our AI creates content and optimizes your site structure.</p>
              </div>
              <div className="text-center">
                <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">3</div>
                <h3 className="text-xl font-semibold mb-2">Customize & Publish</h3>
                <p>Fine-tune your site and publish it with a single click.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-gray-100">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-12">What Our Customers Say</h2>
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
              <p className="text-lg mb-4">{testimonials[activeTestimonial].content}</p>
              <p className="font-semibold">{testimonials[activeTestimonial].name}</p>
              <p className="text-gray-600">{testimonials[activeTestimonial].role}</p>
              <div className="flex justify-center mt-6 space-x-4">
                <button onClick={() => cycleTestimonials('prev')} className="text-blue-600 hover:text-blue-800">
                  <FaChevronLeft />
                </button>
                <button onClick={() => cycleTestimonials('next')} className="text-blue-600 hover:text-blue-800">
                  <FaChevronRight />
                </button>
              </div>
            </div>
          </div>
        </section>

        <section id="pricing" className="py-20">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-12">Simple, Transparent Pricing</h2>
            <div className="flex justify-center items-center mb-8">
              <span className={`mr-4 ${pricingPlan === 'monthly' ? 'font-semibold' : ''}`}>Monthly</span>
              <button
                onClick={changePricingPlan}
                className={`w-14 h-7 flex items-center ${pricingPlan === 'monthly' ? 'bg-gray-300' : 'bg-blue-600'} rounded-full p-1 duration-300 ease-in-out`}
              >
                <div className={`bg-white w-5 h-5 rounded-full shadow-md transform duration-300 ease-in-out ${pricingPlan === 'monthly' ? '' : 'translate-x-7'}`} />
              </button>
              <span className={`ml-4 ${pricingPlan === 'annual' ? 'font-semibold' : ''}`}>Annual (Save 20%)</span>
            </div>
            <div className="flex flex-col md:flex-row justify-center space-y-8 md:space-y-0 md:space-x-8">
              <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <h3 className="text-2xl font-bold mb-4">Basic</h3>
                <p className="text-4xl font-bold mb-6">${pricingPlan === 'monthly' ? '29' : '279'}<span className="text-base font-normal">/{pricingPlan === 'monthly' ? 'mo' : 'yr'}</span></p>
                <ul className="mb-8 space-y-2">
                  <li><FaCheck className="inline-block mr-2 text-green-500" /> Up to 5 pages</li>
                  <li><FaCheck className="inline-block mr-2 text-green-500" /> Basic SEO optimization</li>
                  <li><FaCheck className="inline-block mr-2 text-green-500" /> 24/7 support</li>
                </ul>
                <button onClick={() => openSignupModal('Basic')} className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition duration-300">Get Started</button>
              </div>
              <div className="bg-white p-8 rounded-lg shadow-md text-center border-2 border-blue-600">
                <h3 className="text-2xl font-bold mb-4">Pro</h3>
                <p className="text-4xl font-bold mb-6">${pricingPlan === 'monthly' ? '59' : '559'}<span className="text-base font-normal">/{pricingPlan === 'monthly' ? 'mo' : 'yr'}</span></p>
                <ul className="mb-8 space-y-2">
                  <li><FaCheck className="inline-block mr-2 text-green-500" /> Unlimited pages</li>
                  <li><FaCheck className="inline-block mr-2 text-green-500" /> Advanced SEO tools</li>
                  <li><FaCheck className="inline-block mr-2 text-green-500" /> Priority support</li>
                  <li><FaCheck className="inline-block mr-2 text-green-500" /> Custom domain</li>
                </ul>
                <button onClick={() => openSignupModal('Pro')} className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition duration-300">Get Started</button>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-gray-100">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-2">How does SiteGenie work?</h3>
                <p>SiteGenie uses advanced AI to generate content and structure for your website based on your input. Simply provide some basic information, and our AI will create a fully-functional, SEO-optimized website for you.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-2">Can I customize the generated content?</h3>
                <p>Absolutely! While SiteGenie creates high-quality content for you, you have full control to edit, modify, or replace any part of the generated content to better suit your needs.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-2">Is SiteGenie suitable for e-commerce websites?</h3>
                <p>Yes, SiteGenie can help you create e-commerce websites. Our AI can generate product descriptions, category pages, and other essential elements for online stores. However, you may need to integrate with a separate e-commerce platform for advanced features.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-blue-600 text-white">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-8">Stay Updated</h2>
            <p className="text-center mb-8">Subscribe to our newsletter for the latest updates and tips on website creation.</p>
            <form onSubmit={submitNewsletterSignup} className="max-w-md mx-auto">
              <div className="flex">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-grow px-4 py-2 rounded-l-md text-gray-900"
                  required
                />
                <button type="submit" className="bg-white text-blue-600 px-6 py-2 rounded-r-md hover:bg-gray-100 transition duration-300" disabled={isSubmitting}>
                  {isSubmitting ? 'Subscribing...' : 'Subscribe'}
                </button>
              </div>
              {submitMessage && <p className="mt-2 text-center">{submitMessage}</p>}
            </form>
          </div>
        </section>
      </main>

      {showSignupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Sign Up for {selectedPlan} Plan</h2>
            <p className="mb-6">Great choice! Let's get you started with SiteGenie.</p>
            <Link to="/signup" className="block w-full bg-blue-600 text-white text-center px-4 py-2 rounded hover:bg-blue-700 transition duration-300">Continue to Sign Up</Link>
            <button onClick={() => setShowSignupModal(false)} className="mt-4 w-full text-gray-600 hover:text-gray-800">Cancel</button>
          </div>
        </div>
      )}
    </>
  );
};

export default UV_Landing;