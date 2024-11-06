import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const UV_Landing: React.FC = () => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [pricingPlan, setPricingPlan] = useState<'monthly' | 'annual'>('monthly');
  const [email, setEmail] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const testimonials = [
    { id: 1, name: 'John Doe', role: 'Entrepreneur', content: 'SiteGenie helped me launch my business website in no time!' },
    { id: 2, name: 'Jane Smith', role: 'Blogger', content: 'I was able to create a beautiful blog without any coding knowledge.' },
    { id: 3, name: 'Mike Johnson', role: 'Small Business Owner', content: 'The AI-generated content saved me weeks of work.' },
  ];

  const features = [
    { id: 1, title: 'AI-Powered Content', description: 'Generate high-quality, SEO-optimized content with a single click.' },
    { id: 2, title: 'Responsive Design', description: 'Create websites that look great on any device, automatically.' },
    { id: 3, title: 'SEO Optimization', description: 'Built-in tools to help your site rank higher in search results.' },
    { id: 4, title: 'Easy Customization', description: 'Tailor your site's look and feel without any coding required.' },
  ];

  const pricingPlans = {
    monthly: [
      { id: 1, name: 'Basic', price: 9.99, features: ['5 Pages', 'Basic SEO', 'Custom Domain'] },
      { id: 2, name: 'Pro', price: 19.99, features: ['Unlimited Pages', 'Advanced SEO', 'E-commerce Integration'] },
      { id: 3, name: 'Enterprise', price: 49.99, features: ['Priority Support', 'Custom Branding', 'API Access'] },
    ],
    annual: [
      { id: 1, name: 'Basic', price: 99.99, features: ['5 Pages', 'Basic SEO', 'Custom Domain'] },
      { id: 2, name: 'Pro', price: 199.99, features: ['Unlimited Pages', 'Advanced SEO', 'E-commerce Integration'] },
      { id: 3, name: 'Enterprise', price: 499.99, features: ['Priority Support', 'Custom Branding', 'API Access'] },
    ],
  };

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setShowMobileMenu(false);
  };

  const changePricingPlan = () => {
    setPricingPlan(pricingPlan === 'monthly' ? 'annual' : 'monthly');
  };

  const cycleTestimonials = useCallback(() => {
    setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
  }, [testimonials.length]);

  useEffect(() => {
    const interval = setInterval(cycleTestimonials, 5000);
    return () => clearInterval(interval);
  }, [cycleTestimonials]);

  const openSignupModal = (plan: string) => {
    // For now, we'll just redirect to the signup page
    // In a real implementation, you might want to pass the selected plan as a parameter
    window.location.href = '/signup';
  };

  const validateEmail = (email: string) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
  };

  const submitNewsletterSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setIsEmailValid(false);
      return;
    }
    setIsEmailValid(true);
    setIsSubmitting(true);
    try {
      const response = await axios.post('http://localhost:1337/api/newsletter/signup', { email });
      setSubmitMessage('Thank you for subscribing!');
      setEmail('');
    } catch (error) {
      setSubmitMessage('An error occurred. Please try again later.');
    }
    setIsSubmitting(false);
  };

  return (
    <>
      <header className="bg-white shadow-md">
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
            <div className="md:hidden">
              <button onClick={toggleMobileMenu} className="text-gray-600 hover:text-gray-800">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
              </button>
            </div>
          </div>
          {showMobileMenu && (
            <div className="mt-4 md:hidden">
              <button onClick={() => scrollToSection('features')} className="block py-2 text-gray-600 hover:text-gray-800">Features</button>
              <button onClick={() => scrollToSection('how-it-works')} className="block py-2 text-gray-600 hover:text-gray-800">How It Works</button>
              <button onClick={() => scrollToSection('pricing')} className="block py-2 text-gray-600 hover:text-gray-800">Pricing</button>
              <Link to="/login" className="block py-2 text-blue-600 hover:text-blue-800">Login</Link>
              <Link to="/signup" className="block py-2 bg-blue-600 text-white px-4 rounded hover:bg-blue-700">Sign Up</Link>
            </div>
          )}
        </nav>
      </header>

      <main>
        <section className="bg-gray-100 py-20">
          <div className="container mx-auto px-6 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">Create Your Website with AI</h1>
            <p className="text-xl mb-8">SiteGenie turns your ideas into a fully-functional website in minutes.</p>
            <Link to="/signup" className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg hover:bg-blue-700 transition duration-300">Get Started Free</Link>
          </div>
        </section>

        <section id="features" className="py-20">
          <div className="container mx-auto px-6">
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

        <section id="how-it-works" className="bg-gray-100 py-20">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
            <div className="flex flex-col md:flex-row justify-center items-center space-y-8 md:space-y-0 md:space-x-12">
              <div className="text-center">
                <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mb-4 mx-auto">1</div>
                <h3 className="text-xl font-semibold mb-2">Upload Your Content</h3>
                <p className="text-gray-600">Provide your page names and descriptions in a simple CSV file.</p>
              </div>
              <div className="text-center">
                <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mb-4 mx-auto">2</div>
                <h3 className="text-xl font-semibold mb-2">AI Magic</h3>
                <p className="text-gray-600">Our AI generates high-quality, SEO-optimized content for your site.</p>
              </div>
              <div className="text-center">
                <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mb-4 mx-auto">3</div>
                <h3 className="text-xl font-semibold mb-2">Customize & Launch</h3>
                <p className="text-gray-600">Refine your site's design and content, then publish with one click.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-12">What Our Customers Say</h2>
            <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto">
              <p className="text-gray-600 mb-4">{testimonials[activeTestimonial].content}</p>
              <p className="font-semibold">{testimonials[activeTestimonial].name}</p>
              <p className="text-sm text-gray-500">{testimonials[activeTestimonial].role}</p>
            </div>
            <div className="flex justify-center mt-8 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`w-3 h-3 rounded-full ${index === activeTestimonial ? 'bg-blue-600' : 'bg-gray-300'}`}
                  aria-label={`View testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="bg-gray-100 py-20">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-8">Pricing Plans</h2>
            <div className="flex justify-center items-center mb-8">
              <span className={`mr-3 ${pricingPlan === 'monthly' ? 'text-blue-600 font-semibold' : 'text-gray-600'}`}>Monthly</span>
              <button
                onClick={changePricingPlan}
                className={`w-14 h-8 flex items-center ${pricingPlan === 'monthly' ? 'bg-gray-200' : 'bg-blue-600'} rounded-full p-1 duration-300 ease-in-out`}
              >
                <div className={`bg-white w-6 h-6 rounded-full shadow-md transform duration-300 ease-in-out ${pricingPlan === 'monthly' ? 'translate-x-0' : 'translate-x-6'}`} />
              </button>
              <span className={`ml-3 ${pricingPlan === 'annual' ? 'text-blue-600 font-semibold' : 'text-gray-600'}`}>Annual</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {pricingPlans[pricingPlan].map((plan) => (
                <div key={plan.id} className="bg-white p-8 rounded-lg shadow-md">
                  <h3 className="text-2xl font-bold mb-4">{plan.name}</h3>
                  <p className="text-4xl font-bold mb-6">${plan.price}<span className="text-sm text-gray-500">/{pricingPlan === 'monthly' ? 'mo' : 'yr'}</span></p>
                  <ul className="mb-8">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center mb-2">
                        <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <button onClick={() => openSignupModal(plan.name)} className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-300">Get Started</button>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
            <div className="max-w-3xl mx-auto">
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-2">How does SiteGenie work?</h3>
                <p className="text-gray-600">SiteGenie uses advanced AI to generate high-quality, SEO-optimized content based on your input. Simply provide your page names and descriptions, and our AI will create a fully-structured website for you.</p>
              </div>
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-2">Do I need coding skills to use SiteGenie?</h3>
                <p className="text-gray-600">Not at all! SiteGenie is designed for users with no coding experience. Our intuitive interface and AI-powered tools make it easy for anyone to create a professional website.</p>
              </div>
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-2">Can I customize the generated content?</h3>
                <p className="text-gray-600">Absolutely! While SiteGenie provides high-quality initial content, you have full control to edit, refine, and customize every aspect of your website to match your vision.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-gray-100 py-20">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-8">Stay Updated</h2>
            <p className="text-center mb-8">Subscribe to our newsletter for the latest features and tips.</p>
            <form onSubmit={submitNewsletterSignup} className="max-w-md mx-auto">
              <div className="flex">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className={`flex-grow px-4 py-2 rounded-l-lg focus:outline-none ${!isEmailValid ? 'border-red-500' : ''}`}
                />
                <button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white px-6 py-2 rounded-r-lg hover:bg-blue-700 transition duration-300">
                  {isSubmitting ? 'Submitting...' : 'Subscribe'}
                </button>
              </div>
              {!isEmailValid && <p className="text-red-500 mt-2">Please enter a valid email address.</p>}
              {submitMessage && <p className="text-green-500 mt-2">{submitMessage}</p>}
            </form>
          </div>
        </section>
      </main>

      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-xl font-bold">SiteGenie</h3>
              <p className="text-sm">© 2023 SiteGenie. All rights reserved.</p>
            </div>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-gray-300">Terms of Service</a>
              <a href="#" className="hover:text-gray-300">Privacy Policy</a>
              <a href="#" className="hover:text-gray-300">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default UV_Landing;