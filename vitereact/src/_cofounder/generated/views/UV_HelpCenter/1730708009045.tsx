import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { debounce } from 'lodash';
import { RootState } from '@/store/main';
import { Search, HelpCircle, FileText, MessageSquare, ChevronRight } from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const UV_HelpCenter: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ id: string; title: string; excerpt: string; category: string }>>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [popularTopics, setPopularTopics] = useState<Array<{ id: string; title: string; views: number }>>([]);
  const [faqList, setFaqList] = useState<Array<{ question: string; answer: string }>>([]);
  const [supportTicket, setSupportTicket] = useState({
    subject: '',
    description: '',
    priority: 'normal',
    attachments: [] as File[]
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const userAuth = useSelector((state: RootState) => state.user_auth);

  const api = axios.create({
    baseURL: 'http://localhost:1337/api',
    headers: {
      Authorization: `Bearer ${userAuth.token}`
    }
  });

  const fetchPopularTopics = async () => {
    try {
      const response = await api.get('/help/popular-topics');
      setPopularTopics(response.data);
    } catch (err) {
      console.error('Error fetching popular topics:', err);
      setError('Failed to fetch popular topics');
    }
  };

  const fetchFaqList = async () => {
    try {
      const response = await api.get('/help/faq');
      setFaqList(response.data);
    } catch (err) {
      console.error('Error fetching FAQ list:', err);
      setError('Failed to fetch FAQ list');
    }
  };

  useEffect(() => {
    fetchPopularTopics();
    fetchFaqList();
  }, []);

  const performSearch = async (query: string) => {
    if (!query) {
      setSearchResults([]);
      return;
    }
    setIsLoading(true);
    try {
      const response = await api.get(`/help/search?query=${encodeURIComponent(query)}`);
      setSearchResults(response.data);
    } catch (err) {
      console.error('Error performing search:', err);
      setError('Search failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const debouncedSearch = useCallback(debounce(performSearch, 300), []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    debouncedSearch(e.target.value);
  };

  const selectCategory = async (category: string) => {
    setSelectedCategory(category);
    setIsLoading(true);
    try {
      const response = await api.get(`/help/articles?category=${encodeURIComponent(category)}`);
      setSearchResults(response.data);
    } catch (err) {
      console.error('Error fetching category articles:', err);
      setError('Failed to fetch category articles');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSupportTicketChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setSupportTicket({ ...supportTicket, [e.target.name]: e.target.value });
  };

  const handlePriorityChange = (value: string) => {
    setSupportTicket({ ...supportTicket, priority: value });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSupportTicket({ ...supportTicket, attachments: Array.from(e.target.files) });
    }
  };

  const submitSupportTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const formData = new FormData();
      Object.entries(supportTicket).forEach(([key, value]) => {
        if (key === 'attachments') {
          value.forEach((file: File) => formData.append('attachments', file));
        } else {
          formData.append(key, value as string);
        }
      });
      await api.post('/support/tickets', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Support ticket submitted successfully!');
      setSupportTicket({ subject: '', description: '', priority: 'normal', attachments: [] });
    } catch (err) {
      console.error('Error submitting support ticket:', err);
      setError('Failed to submit support ticket');
    } finally {
      setIsLoading(false);
    }
  };

  const rateArticle = async (articleId: string, rating: number) => {
    try {
      await api.post(`/help/articles/${articleId}/rate`, { rating });
      alert('Thank you for rating this article!');
    } catch (err) {
      console.error('Error rating article:', err);
      setError('Failed to submit article rating');
    }
  };

  const startLiveChat = async () => {
    try {
      const response = await api.post('/support/chat');
      alert(`Chat session initiated. Session ID: ${response.data.sessionId}`);
    } catch (err) {
      console.error('Error starting live chat:', err);
      setError('Failed to start live chat');
    }
  };

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <main className="flex-grow">
            <h1 className="text-3xl font-bold mb-8">Help Center</h1>

            <div className="mb-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search for help..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="pl-10 w-full"
                />
              </div>
            </div>

            <Tabs defaultValue="popular" className="mb-8">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="popular">Popular Topics</TabsTrigger>
                <TabsTrigger value="categories">Categories</TabsTrigger>
                <TabsTrigger value="faq">FAQ</TabsTrigger>
              </TabsList>
              
              <TabsContent value="popular">
                <Card>
                  <CardHeader>
                    <CardTitle>Popular Topics</CardTitle>
                    <CardDescription>Frequently accessed help topics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {popularTopics.map((topic) => (
                        <li key={topic.id} className="bg-gray-100 p-4 rounded">
                          <Link to={`/help/topic/${topic.id}`} className="text-blue-600 hover:underline flex items-center">
                            <HelpCircle className="mr-2 h-4 w-4" />
                            {topic.title}
                          </Link>
                          <span className="text-sm text-gray-500 block mt-1">Views: {topic.views}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="categories">
                <Card>
                  <CardHeader>
                    <CardTitle>Browse by Category</CardTitle>
                    <CardDescription>Select a category to view related articles</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {['all', 'getting-started', 'account', 'content-creation', 'seo', 'exporting'].map((category) => (
                        <Button
                          key={category}
                          onClick={() => selectCategory(category)}
                          variant={selectedCategory === category ? "default" : "outline"}
                        >
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </Button>
                      ))}
                    </div>
                    {searchResults.length > 0 && (
                      <ul className="space-y-4">
                        {searchResults.map((result) => (
                          <li key={result.id} className="border-b pb-4">
                            <h3 className="text-lg font-medium">{result.title}</h3>
                            <p className="text-gray-600 mt-1">{result.excerpt}</p>
                            <span className="text-sm text-gray-500 block mt-1">{result.category}</span>
                            <div className="mt-2">
                              <Button onClick={() => rateArticle(result.id, 1)} variant="outline" size="sm" className="mr-2">
                                Helpful
                              </Button>
                              <Button onClick={() => rateArticle(result.id, 0)} variant="outline" size="sm">
                                Not Helpful
                              </Button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="faq">
                <Card>
                  <CardHeader>
                    <CardTitle>Frequently Asked Questions</CardTitle>
                    <CardDescription>Quick answers to common questions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      {faqList.map((faq, index) => (
                        <AccordionItem key={index} value={`item-${index}`}>
                          <AccordionTrigger>{faq.question}</AccordionTrigger>
                          <AccordionContent>{faq.answer}</AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Submit a Support Ticket</CardTitle>
                <CardDescription>Need more help? Submit a ticket and we'll get back to you.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={submitSupportTicket} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      name="subject"
                      value={supportTicket.subject}
                      onChange={handleSupportTicketChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={supportTicket.description}
                      onChange={handleSupportTicketChange}
                      required
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select onValueChange={handlePriorityChange} value={supportTicket.priority}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="attachments">Attachments</Label>
                    <Input
                      id="attachments"
                      name="attachments"
                      type="file"
                      onChange={handleFileUpload}
                      multiple
                    />
                  </div>
                  <Button type="submit">Submit Ticket</Button>
                </form>
              </CardContent>
            </Card>
          </main>

          <aside className="w-full md:w-64 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Quick Links</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li>
                    <Link to="/help/getting-started" className="text-blue-600 hover:underline flex items-center">
                      <ChevronRight className="mr-2 h-4 w-4" />
                      Getting Started
                    </Link>
                  </li>
                  <li>
                    <Link to="/help/account" className="text-blue-600 hover:underline flex items-center">
                      <ChevronRight className="mr-2 h-4 w-4" />
                      Account Settings
                    </Link>
                  </li>
                  <li>
                    <Link to="/help/billing" className="text-blue-600 hover:underline flex items-center">
                      <ChevronRight className="mr-2 h-4 w-4" />
                      Billing & Subscriptions
                    </Link>
                  </li>
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Need More Help?</CardTitle>
              </CardHeader>
              <CardContent>
                <Button onClick={startLiveChat} className="w-full">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Start Live Chat
                </Button>
              </CardContent>
            </Card>
          </aside>
        </div>

        {isLoading && <div className="text-center mt-4">Loading...</div>}
        {error && <div className="text-red-500 mt-4">{error}</div>}
      </div>
    </>
  );
};

export default UV_HelpCenter;