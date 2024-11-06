import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const UV_Landing: React.FC = () => {
  const [showMobileMenu, setShowMobileMenu] = useState<boolean>(false);
  const [activeTestimonial, setActiveTestimonial] = useState<number>(0);
  const [pricingPlan, setPricingPlan] = useState<string>('monthly');
  const [email, setEmail] = useState<string>('');
  const [newsletterStatus, setNewsletterStatus] = useState<string>('');

  const testimonials = [
    { name: 'John Doe', role: 'Small Business Owner', content: 'SiteGenie transformed my online presence. It\'s incredibly easy to use and the results are professional.' },
    { name: 'Jane Smith', role: 'Digital Marketer', content: 'The SEO optimization features are a game-changer. My clients\' websites are ranking higher than ever.' },
    { name: 'Mike Johnson', role: 'Blogger', content: 'I was able to create a stunning blog in minutes. SiteGenie is a must-have tool for content creators.' },
  ];

  const features = [
    { title: 'AI-Powered Content Creation', description: 'Generate high-quality, SEO-optimized content with a single click.' },
    { title: 'Responsive Design', description: 'Your website looks great on all devices, from mobile to desktop.' },
    { title: 'SEO Optimization', description: 'Built-in tools to boost your search engine rankings and visibility.' },
    { title: 'Easy Customization', description: 'Tailor your website\'s look and feel without any coding knowledge.' },
  ];

  const pricingPlans = {
    monthly: [
      { name: 'Basic', price: '$19', features: ['AI Content Generation', 'Responsive Design', 'Basic SEO Tools'] },
      { name: 'Pro', price: '$49', features: ['Everything in Basic', 'Advanced SEO Optimization', 'Custom Domain'] },
      { name: 'Enterprise', price: '$99', features: ['Everything in Pro', 'Priority Support', 'Custom Integrations'] },
    ],
    annual: [
      { name: 'Basic', price: '$190', features: ['AI Content Generation', 'Responsive Design', 'Basic SEO Tools'] },
      { name: 'Pro', price: '$490', features: ['Everything in Basic', 'Advanced SEO Optimization', 'Custom Domain'] },
      { name: 'Enterprise', price: '$990', features: ['Everything in Pro', 'Priority Support', 'Custom Integrations'] },
    ],
  };

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  const cycleTestimonials = useCallback(() => {
    setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
  }, [testimonials.length]);

  useEffect(() => {
    const interval = setInterval(cycleTestimonials, 5000);
    return () => clearInterval(interval);
  }, [cycleTestimonials]);

  const changePricingPlan = () => {
    setPricingPlan(pricingPlan === 'monthly' ? 'annual' : 'monthly');
  };

  const submitNewsletterSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:1337/api/newsletter/signup', { email });
      setNewsletterStatus('Thank you for subscribing!');
      setEmail('');
    } catch (error) {
      setNewsletterStatus('An error occurred. Please try again.');
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
            <div className="container mx-auto px-4 flex flex-col space-y-2">
              <button onClick={() => { scrollToSection('features'); toggleMobileMenu(); }} className="text-gray-600 hover:text-blue-600">Features</button>
              <button onClick={() => { scrollToSection('how-it-works'); toggleMobileMenu(); }} className="text-gray-600 hover:text-blue-600">How It Works</button>
              <button onClick={() => { scrollToSection('pricing'); toggleMobileMenu(); }} className="text-gray-600 hover:text-blue-600">Pricing</button>
              <Link to="/login" className="text-gray-600 hover:text-blue-600">Login</Link>
              <Link to="/signup" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-center">Sign Up</Link>
            </div>
          </div>
        )}
      </header>

      <main>
        <section className="bg-gray-50 py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Create Your Dream Website in Minutes with AI</h1>
              <p className="text-xl mb-8">SiteGenie harnesses the power of AI to build beautiful, SEO-optimized websites tailored to your needs.</p>
              <Link to="/signup" className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition duration-300">Get Started for Free</Link>
            </div>
          </div>
        </section>

        <section id="features" className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Features That Set Us Apart</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="bg-gray-50 py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
            <div className="max-w-3xl mx-auto">
              <div className="flex flex-col md:flex-row items-center mb-12">
                <div className="md:w-1/2 mb-6 md:mb-0 md:pr-8">
                  <h3 className="text-2xl font-semibold mb-4">1. Input Your Content</h3>
                  <p className="text-gray-600">Simply upload a CSV file with your page names and descriptions.</p>
                </div>
                <div className="md:w-1/2">
                  <img src="https://picsum.photos/seed/input/400/300" alt="Input content" className="rounded-lg shadow-md" />
                </div>
              </div>
              <div className="flex flex-col md:flex-row-reverse items-center mb-12">
                <div className="md:w-1/2 mb-6 md:mb-0 md:pl-8">
                  <h3 className="text-2xl font-semibold mb-4">2. AI Generates Your Site</h3>
                  <p className="text-gray-600">Our AI analyzes your input and creates a fully-structured, SEO-optimized website.</p>
                </div>
                <div className="md:w-1/2">
                  <img src="https://picsum.photos/seed/generate/400/300" alt="AI generation" className="rounded-lg shadow-md" />
                </div>
              </div>
              <div className="flex flex-col md:flex-row items-center">
                <div className="md:w-1/2 mb-6 md:mb-0 md:pr-8">
                  <h3 className="text-2xl font-semibold mb-4">3. Customize and Launch</h3>
                  <p className="text-gray-600">Review, edit, and customize your site, then publish it with a single click.</p>
                </div>
                <div className="md:w-1/2">
                  <img src="https://picsum.photos/seed/launch/400/300" alt="Customize and launch" className="rounded-lg shadow-md" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">What Our Customers Say</h2>
            <div className="max-w-3xl mx-auto">
              <div className="bg-white p-8 rounded-lg shadow-md">
                <p className="text-xl mb-4">{testimonials[activeTestimonial].content}</p>
                <div className="flex items-center">
                  <img src={`https://picsum.photos/seed/${testimonials[activeTestimonial].name}/50/50`} alt={testimonials[activeTestimonial].name} className="rounded-full mr-4" />
                  <div>
                    <p className="font-semibold">{testimonials[activeTestimonial].name}</p>
                    <p className="text-gray-600">{testimonials[activeTestimonial].role}</p>
                  </div>
                </div>
              </div>
              <div className="flex justify-center mt-6">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveTestimonial(index)}
                    className={`w-3 h-3 rounded-full mx-1 ${index === activeTestimonial ? 'bg-blue-600' : 'bg-gray-300'}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="pricing" className="bg-gray-50 py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Simple, Transparent Pricing</h2>
            <div className="flex justify-center mb-8">
              <div className="bg-white rounded-full p-1 flex items-center">
                <button
                  onClick={changePricingPlan}
                  className={`px-4 py-2 rounded-full ${pricingPlan === 'monthly' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}
                >
                  Monthly
                </button>
                <button
                  onClick={changePricingPlan}
                  className={`px-4 py-2 rounded-full ${pricingPlan === 'annual' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}
                >
                  Annual
                </button>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {pricingPlans[pricingPlan as keyof typeof pricingPlans].map((plan, index) => (
                <div key={index} className="bg-white p-8 rounded-lg shadow-md">
                  <h3 className="text-2xl font-semibold mb-4">{plan.name}</h3>
                  <p className="text-4xl font-bold mb-6">{plan.price}<span className="text-lg font-normal text-gray-600">/{pricingPlan === 'monthly' ? 'mo' : 'yr'}</span></p>
                  <ul className="mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center mb-2">
                        <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link to="/signup" className="block w-full bg-blue-600 text-white text-center px-4 py-2 rounded hover:bg-blue-700 transition duration-300">Get Started</Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
            <div className="max-w-3xl mx-auto">
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-2">How does SiteGenie work?</h3>
                <p className="text-gray-600">SiteGenie uses advanced AI to generate a website based on your input. Simply provide page names and descriptions, and our AI will create a fully-structured, SEO-optimized website for you.</p>
              </div>
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-2">Do I need coding skills to use SiteGenie?</h3>
                <p className="text-gray-600">Not at all! SiteGenie is designed for users of all skill levels. Our intuitive interface and AI-powered generation mean you can create a professional website without any coding knowledge.</p>
              </div>
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-2">Can I customize the generated website?</h3>
                <p className="text-gray-600">Absolutely! While SiteGenie creates a great starting point, you have full control to edit and customize your website's content, design, and structure to match your vision perfectly.</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Is my website SEO-friendly?</h3>
                <p className="text-gray-600">Yes, all websites created with SiteGenie are optimized for search engines. We implement best SEO practices, including proper site structure, meta tags, and content optimization.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-blue-600 text-white py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-8">Ready to Create Your Dream Website?</h2>
              <p className="text-xl mb-8">Join thousands of satisfied users and start building your website today.</p>
              <Link to="/signup" className="bg-white text-blue-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100 transition duration-300">Get Started for Free</Link>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Stay Updated</h2>
            <div className="max-w-xl mx-auto">
              <form onSubmit={submitNewsletterSignup} className="flex flex-col md:flex-row">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-grow px-4 py-2 mb-4 md:mb-0 md:mr-4 border border-gray-300 rounded"
                  required
                />
                <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition duration-300">
                  Subscribe
                </button>
              </form>
              {newsletterStatus && <p className="mt-4 text-center text-green-600">{newsletterStatus}</p>}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-between">
            <div className="w-full md:w-1/4 mb-6 md:mb-0">
              <h3 className="text-xl font-semibold mb-4">SiteGenie</h3>
              <p>Creating beautiful websites with the power of AI.</p>
            </div>
            <div className="w-full md:w-1/4 mb-6 md:mb-0">
              <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
              <ul>
                <li><button onClick={() => scrollToSection('features')} className="hover:text-blue-400">Features</button></li>
                <li><button onClick={() => scrollToSection('how-it-works')} className="hover:text-blue-400">How It Works</button></li>
                <li><button onClick={() => scrollToSection('pricing')} className="hover:text-blue-400">Pricing</button></li>
                <li><Link to="/login" className="hover:text-blue-400">Login</Link></li>
                <li><Link to="/signup" className="hover:text-blue-400">Sign Up</Link></li>
              </ul>
            </div>
            <div className="w-full md:w-1/4 mb-6 md:mb-0">
              <h3 className="text-xl font-semibold mb-4">Contact</h3>
              <p>Email: support@sitegenie.com</p>
              <p>Phone: (555) 123-4567</p>
            </div>
            <div className="w-full md:w-1/4">
              <h3 className="text-xl font-semibold mb-4">Follow Us</h3>
              <div className="flex space-x-4">
                <a href="#" className="hover:text-blue-400">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="#" className="hover:text-blue-400">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                <a href="#" className="hover:text-blue-400">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div className="mt-8 text-center">
            <p>&copy; 2023 SiteGenie. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default UV_Landing;