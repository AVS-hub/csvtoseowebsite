import React, { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const UV_Landing: React.FC = () => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [pricingPlan, setPricingPlan] = useState<'monthly' | 'annual'>('monthly');
  const [email, setEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const toggleMobileMenu = useCallback(() => {
    setShowMobileMenu(prev => !prev);
  }, []);

  const scrollToSection = useCallback((sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const changePricingPlan = useCallback(() => {
    setPricingPlan(prev => prev === 'monthly' ? 'annual' : 'monthly');
  }, []);

  const cycleTestimonials = useCallback(() => {
    setActiveTestimonial(prev => (prev + 1) % testimonials.length);
  }, []);

  const openSignupModal = useCallback((plan: 'monthly' | 'annual') => {
    // In a real implementation, this would open a modal
    console.log(`Opening signup modal for ${plan} plan`);
  }, []);

  const submitNewsletterSignup = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setNewsletterStatus('loading');
    try {
      await axios.post('http://localhost:1337/api/newsletter/signup', { email });
      setNewsletterStatus('success');
      setEmail('');
    } catch (error) {
      setNewsletterStatus('error');
    }
  }, [email]);

  useEffect(() => {
    const intervalId = setInterval(cycleTestimonials, 5000);
    return () => clearInterval(intervalId);
  }, [cycleTestimonials]);

  const features = [
    { title: 'AI-Powered Content', description: 'Generate high-quality, SEO-optimized content with a click.' },
    { title: 'Responsive Design', description: 'Create websites that look great on any device.' },
    { title: 'SEO Optimization', description: 'Built-in tools to boost your search engine rankings.' },
    { title: 'Easy Customization', description: 'Tailor your site with our intuitive drag-and-drop editor.' },
  ];

  const testimonials = [
    { name: 'John Doe', role: 'Small Business Owner', content: 'SiteGenie transformed my online presence. It\'s incredibly easy to use!' },
    { name: 'Jane Smith', role: 'Marketing Manager', content: 'The AI-generated content saved us countless hours. Highly recommended!' },
    { name: 'Mike Johnson', role: 'Freelance Designer', content: 'As a designer, I appreciate the clean code and customization options.' },
  ];

  const faqItems = [
    { question: 'How does SiteGenie work?', answer: 'SiteGenie uses AI to generate website content and structure based on your input. Simply provide some basic information, and we\'ll create a fully-functional website for you.' },
    { question: 'Is technical knowledge required?', answer: 'Not at all! SiteGenie is designed for users of all skill levels. Our intuitive interface makes website creation accessible to everyone.' },
    { question: 'Can I customize my website?', answer: 'Absolutely! While SiteGenie generates the initial content and design, you have full control to customize every aspect of your site.' },
    { question: 'What about SEO?', answer: 'SEO is built into SiteGenie. We automatically optimize your content and structure for search engines, helping your site rank higher.' },
  ];

  return (
    <>
      {/* Header */}
      <header className="bg-white shadow-md">
        <nav className="container mx-auto px-6 py-3">
          <div className="flex justify-between items-center">
            <div className="text-xl font-bold text-gray-800">SiteGenie</div>
            <div className="hidden md:flex space-x-4">
              <button onClick={() => scrollToSection('features')} className="text-gray-600 hover:text-gray-800">Features</button>
              <button onClick={() => scrollToSection('how-it-works')} className="text-gray-600 hover:text-gray-800">How It Works</button>
              <button onClick={() => scrollToSection('pricing')} className="text-gray-600 hover:text-gray-800">Pricing</button>
              <Link to="/login" className="text-blue-600 hover:text-blue-800">Log In</Link>
              <Link to="/signup" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Sign Up</Link>
            </div>
            <button className="md:hidden" onClick={toggleMobileMenu}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </nav>
        {showMobileMenu && (
          <div className="md:hidden bg-white py-2">
            <button onClick={() => scrollToSection('features')} className="block w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-100">Features</button>
            <button onClick={() => scrollToSection('how-it-works')} className="block w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-100">How It Works</button>
            <button onClick={() => scrollToSection('pricing')} className="block w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-100">Pricing</button>
            <Link to="/login" className="block w-full text-left px-4 py-2 text-blue-600 hover:bg-gray-100">Log In</Link>
            <Link to="/signup" className="block w-full text-left px-4 py-2 text-blue-600 hover:bg-gray-100">Sign Up</Link>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="bg-blue-50 py-20">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-4">Create Your Website with AI</h1>
          <p className="text-xl text-gray-600 mb-8">Transform your ideas into a fully-functional website in minutes with SiteGenie's AI-powered platform.</p>
          <Link to="/signup" className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition duration-300">Get Started for Free</Link>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Powerful Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="bg-gray-50 py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">How It Works</h2>
          <div className="flex flex-col md:flex-row justify-center items-center space-y-8 md:space-y-0 md:space-x-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center max-w-sm">
              <div className="text-3xl font-bold text-blue-600 mb-4">1</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Input Your Ideas</h3>
              <p className="text-gray-600">Provide basic information about your website and content ideas.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center max-w-sm">
              <div className="text-3xl font-bold text-blue-600 mb-4">2</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">AI Generation</h3>
              <p className="text-gray-600">Our AI creates your website structure, content, and design.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center max-w-sm">
              <div className="text-3xl font-bold text-blue-600 mb-4">3</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Customize & Launch</h3>
              <p className="text-gray-600">Review, edit, and publish your new website with ease.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">What Our Customers Say</h2>
          <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto">
            <p className="text-gray-600 italic mb-4">{testimonials[activeTestimonial].content}</p>
            <div className="font-semibold text-gray-800">{testimonials[activeTestimonial].name}</div>
            <div className="text-gray-600">{testimonials[activeTestimonial].role}</div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="bg-gray-50 py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Simple, Transparent Pricing</h2>
          <div className="flex justify-center items-center mb-8">
            <span className={`mr-2 ${pricingPlan === 'monthly' ? 'text-blue-600 font-semibold' : 'text-gray-600'}`}>Monthly</span>
            <button
              className={`w-12 h-6 rounded-full p-1 ${pricingPlan === 'annual' ? 'bg-blue-600' : 'bg-gray-300'}`}
              onClick={changePricingPlan}
            >
              <div className={`w-4 h-4 rounded-full bg-white transform duration-300 ${pricingPlan === 'annual' ? 'translate-x-6' : ''}`} />
            </button>
            <span className={`ml-2 ${pricingPlan === 'annual' ? 'text-blue-600 font-semibold' : 'text-gray-600'}`}>Annual (Save 20%)</span>
          </div>
          <div className="flex flex-col md:flex-row justify-center space-y-8 md:space-y-0 md:space-x-8">
            <div className="bg-white p-8 rounded-lg shadow-md max-w-sm w-full">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Basic</h3>
              <div className="text-4xl font-bold text-blue-600 mb-4">
                {pricingPlan === 'monthly' ? '$19' : '$182'}<span className="text-lg text-gray-600 font-normal">{pricingPlan === 'monthly' ? '/mo' : '/yr'}</span>
              </div>
              <ul className="mb-8">
                <li className="flex items-center mb-2"><svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Up to 5 pages</li>
                <li className="flex items-center mb-2"><svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Basic SEO optimization</li>
                <li className="flex items-center mb-2"><svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Mobile responsive</li>
              </ul>
              <button onClick={() => openSignupModal(pricingPlan)} className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-300">Get Started</button>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md max-w-sm w-full border-2 border-blue-600">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Pro</h3>
              <div className="text-4xl font-bold text-blue-600 mb-4">
                {pricingPlan === 'monthly' ? '$49' : '$470'}<span className="text-lg text-gray-600 font-normal">{pricingPlan === 'monthly' ? '/mo' : '/yr'}</span>
              </div>
              <ul className="mb-8">
                <li className="flex items-center mb-2"><svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Unlimited pages</li>
                <li className="flex items-center mb-2"><svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Advanced SEO tools</li>
                <li className="flex items-center mb-2"><svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Custom domain</li>
                <li className="flex items-center mb-2"><svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Priority support</li>
              </ul>
              <button onClick={() => openSignupModal(pricingPlan)} className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-300">Get Started</button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Frequently Asked Questions</h2>
          <div className="max-w-3xl mx-auto">
            {faqItems.map((item, index) => (
              <div key={index} className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{item.question}</h3>
                <p className="text-gray-600">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="bg-blue-600 py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-white mb-8">Stay Updated</h2>
          <p className="text-center text-white mb-8">Subscribe to our newsletter for the latest updates and tips on website creation.</p>
          <form onSubmit={submitNewsletterSignup} className="max-w-md mx-auto">
            <div className="flex">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-grow px-4 py-2 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button
                type="submit"
                className="bg-blue-800 text-white px-6 py-2 rounded-r-lg hover:bg-blue-900 transition duration-300"
                disabled={newsletterStatus === 'loading'}
              >
                {newsletterStatus === 'loading' ? 'Subscribing...' : 'Subscribe'}
              </button>
            </div>
            {newsletterStatus === 'success' && <p className="mt-2 text-green-300">Thank you for subscribing!</p>}
            {newsletterStatus === 'error' && <p className="mt-2 text-red-300">An error occurred. Please try again.</p>}
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap justify-between">
            <div className="w-full md:w-1/4 mb-6 md:mb-0">
              <h3 className="text-lg font-semibold mb-2">SiteGenie</h3>
              <p className="text-gray-400">AI-powered website creation platform</p>
            </div>
            <div className="w-full md:w-1/4 mb-6 md:mb-0">
              <h3 className="text-lg font-semibold mb-2">Quick Links</h3>
              <ul>
                <li><button onClick={() => scrollToSection('features')} className="text-gray-400 hover:text-white">Features</button></li>
                <li><button onClick={() => scrollToSection('how-it-works')} className="text-gray-400 hover:text-white">How It Works</button></li>
                <li><button onClick={() => scrollToSection('pricing')} className="text-gray-400 hover:text-white">Pricing</button></li>
              </ul>
            </div>
            <div className="w-full md:w-1/4 mb-6 md:mb-0">
              <h3 className="text-lg font-semibold mb-2">Legal</h3>
              <ul>
                <li><a href="#" className="text-gray-400 hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Privacy Policy</a></li>
              </ul>
            </div>
            <div className="w-full md:w-1/4">
              <h3 className="text-lg font-semibold mb-2">Connect</h3>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></a>
                <a href="#" className="text-gray-400 hover:text-white"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg></a>
                <a href="#" className="text-gray-400 hover:text-white"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-sm text-center text-gray-400">
            © 2023 SiteGenie. All rights reserved.
          </div>
        </div>
      </footer>
    </>
  );
};

export default UV_Landing;