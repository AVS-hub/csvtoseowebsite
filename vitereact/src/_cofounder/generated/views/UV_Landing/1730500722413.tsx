import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Moon, Sun, Menu, ChevronRight, Check } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const UV_Landing: React.FC = () => {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [pricingPlan, setPricingPlan] = useState<'monthly' | 'annual'>('monthly');
  const [email, setEmail] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const { theme, setTheme } = useTheme();

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

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
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
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 hidden md:flex">
            <Link to="/" className="mr-6 flex items-center space-x-2">
              <span className="font-bold">SiteGenie</span>
            </Link>
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Features</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                      {features.map((feature) => (
                        <li key={feature.id} className="row-span-3">
                          <NavigationMenuLink asChild>
                            <a
                              className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                              href="#"
                            >
                              <div className="mb-2 text-lg font-medium">
                                {feature.title}
                              </div>
                              <p className="text-sm leading-tight text-muted-foreground">
                                {feature.description}
                              </p>
                            </a>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuTrigger onClick={() => scrollToSection('how-it-works')}>
                    How It Works
                  </NavigationMenuTrigger>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuTrigger onClick={() => scrollToSection('pricing')}>
                    Pricing
                  </NavigationMenuTrigger>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="w-full flex-1 md:w-auto md:flex-none">
              <Button variant="ghost" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link to="/signup">Sign Up</Link>
              </Button>
            </div>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Toggle theme"
              className="mr-6"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <Sun className="h-6 w-6 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-6 w-6 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  className="mr-2 px-0 text-base hover:bg-transparent focus:ring-0 md:hidden"
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                  <SheetDescription>
                    Navigate through our website
                  </SheetDescription>
                </SheetHeader>
                <div className="grid gap-4 py-4">
                  <Button variant="ghost" onClick={() => scrollToSection('features')}>Features</Button>
                  <Button variant="ghost" onClick={() => scrollToSection('how-it-works')}>How It Works</Button>
                  <Button variant="ghost" onClick={() => scrollToSection('pricing')}>Pricing</Button>
                  <Button variant="ghost" asChild><Link to="/login">Login</Link></Button>
                  <Button asChild><Link to="/signup">Sign Up</Link></Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Create Your Website with AI
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  SiteGenie turns your ideas into a fully-functional website in minutes.
                </p>
              </div>
              <div className="space-x-4">
                <Button asChild><Link to="/signup">Get Started Free</Link></Button>
                <Button variant="outline">Learn More</Button>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Features</h2>
            <div className="grid gap-6 lg:grid-cols-4 lg:gap-12 mt-8">
              {features.map((feature) => (
                <div key={feature.id} className="flex flex-col items-center space-y-2 border-gray-800 p-4 rounded-lg">
                  <div className="p-2 bg-black bg-opacity-50 rounded-full">
                    <ChevronRight className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold">{feature.title}</h3>
                  <p className="text-zinc-500 dark:text-zinc-400 text-center">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-12">How It Works</h2>
            <div className="grid gap-6 lg:grid-cols-3 lg:gap-12">
              <div className="flex flex-col items-center space-y-2 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500 text-white">1</div>
                <h3 className="text-xl font-bold">Upload Your Content</h3>
                <p className="text-zinc-500 dark:text-zinc-400">Provide your page names and descriptions in a simple CSV file.</p>
              </div>
              <div className="flex flex-col items-center space-y-2 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500 text-white">2</div>
                <h3 className="text-xl font-bold">AI Magic</h3>
                <p className="text-zinc-500 dark:text-zinc-400">Our AI generates high-quality, SEO-optimized content for your site.</p>
              </div>
              <div className="flex flex-col items-center space-y-2 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500 text-white">3</div>
                <h3 className="text-xl font-bold">Customize & Launch</h3>
                <p className="text-zinc-500 dark:text-zinc-400">Refine your site's design and content, then publish with one click.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-12">What Our Customers Say</h2>
            <Carousel className="w-full max-w-xs mx-auto">
              <CarouselContent>
                {testimonials.map((testimonial, index) => (
                  <CarouselItem key={testimonial.id}>
                    <div className="p-4">
                      <blockquote className="space-y-2">
                        <p className="text-lg">{testimonial.content}</p>
                        <footer className="text-sm">
                          <cite className="font-medium">{testimonial.name}</cite>
                          <p>{testimonial.role}</p>
                        </footer>
                      </blockquote>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
        </section>

        <section id="pricing" className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-8">Pricing Plans</h2>
            <div className="flex justify-center items-center mb-8">
              <span className={`mr-3 ${pricingPlan === 'monthly' ? 'text-blue-600 font-semibold' : 'text-gray-600'}`}>Monthly</span>
              <Switch
                checked={pricingPlan === 'annual'}
                onCheckedChange={() => changePricingPlan()}
              />
              <span className={`ml-3 ${pricingPlan === 'annual' ? 'text-blue-600 font-semibold' : 'text-gray-600'}`}>Annual</span>
            </div>
            <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
              {pricingPlans[pricingPlan].map((plan) => (
                <div key={plan.id} className="flex flex-col p-6 bg-white dark:bg-gray-850 rounded-lg shadow-lg">
                  <h3 className="text-2xl font-bold">{plan.name}</h3>
                  <div className="mt-4 text-center">
                    <span className="text-4xl font-bold">${plan.price}</span>
                    <span className="text-gray-500 dark:text-gray-400">/{pricingPlan === 'monthly' ? 'mo' : 'yr'}</span>
                  </div>
                  <ul className="mt-6 space-y-4 flex-1">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <Check className="text-green-500 mr-2 h-5 w-5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="mt-8" onClick={() => openSignupModal(plan.name)}>Get Started</Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-12">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="w-full max-w-3xl mx-auto">
              <AccordionItem value="item-1">
                <AccordionTrigger>How does SiteGenie work?</AccordionTrigger>
                <AccordionContent>
                  SiteGenie uses advanced AI to generate high-quality, SEO-optimized content based on your input. Simply provide your page names and descriptions, and our AI will create a fully-structured website for you.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Do I need coding skills to use SiteGenie?</AccordionTrigger>
                <AccordionContent>
                  Not at all! SiteGenie is designed for users with no coding experience. Our intuitive interface and AI-powered tools make it easy for anyone to create a professional website.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>Can I customize the generated content?</AccordionTrigger>
                <AccordionContent>
                  Absolutely! While SiteGenie provides high-quality initial content, you have full control to edit, refine, and customize every aspect of your website to match your vision.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-8">Stay Updated</h2>
            <p className="text-center mb-8 text-zinc-500 dark:text-zinc-400">Subscribe to our newsletter for the latest features and tips.</p>
            <form onSubmit={submitNewsletterSignup} className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className={!isEmailValid ? 'border-red-500' : ''}
                />
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Subscribe'}
                </Button>
              </div>
              {!isEmailValid && <p className="text-red-500 mt-2">Please enter a valid email address.</p>}
              {submitMessage && <p className="text-green-500 mt-2">{submitMessage}</p>}
            </form>
          </div>
        </section>
      </main>

      <footer className="w-full py-6 bg-gray-800 text-white">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-xl font-bold">SiteGenie</h3>
              <p className="text-sm">© 2023 SiteGenie. All rights reserved.</p>
            </div>
            <div className="flex space-x-4">
              <Link to="#" className="hover:text-gray-300">Terms of Service</Link>
              <Link to="#" className="hover:text-gray-300">Privacy Policy</Link>
              <Link to="#" className="hover:text-gray-300">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default UV_Landing;