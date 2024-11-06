import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { RootState } from '@/store/main';
import axios from 'axios';
import { debounce } from 'lodash';

const UV_HelpCenter: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ id: string; title: string; excerpt: string; category: string }>>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [popularTopics, setPopularTopics] = useState<Array<{ id: string; title: string; views: number }>>([]);
  const [faqList, setFaqList] = useState<Array<{ question: string; answer: string; isExpanded: boolean }>>([]);
  const [supportTicket, setSupportTicket] = useState({
    subject: '',
    description: '',
    priority: 'normal',
    attachments: [] as File[]
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const userAuth = useSelector((state: RootState) => state.user_auth);
  const userProfile = useSelector((state: RootState) => state.user_profile);

  // Mock API calls
  const mockApiCall = async (endpoint: string, params: any = {}) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    switch (endpoint) {
      case '/api/help/search':
        return [
          { id: '1', title: 'How to create a project', excerpt: 'Learn the basics of creating a new project...', category: 'Getting Started' },
          { id: '2', title: 'SEO optimization tips', excerpt: 'Improve your website\'s SEO with these tips...', category: 'SEO' },
        ];
      case '/api/help/popular':
        return [
          { id: '1', title: 'Getting started guide', views: 1000 },
          { id: '2', title: 'How to export your website', views: 800 },
          { id: '3', title: 'Understanding SEO metrics', views: 750 },
        ];
      case '/api/help/faq':
        return [
          { question: 'What is SiteGenie?', answer: 'SiteGenie is an AI-powered website creation platform...', isExpanded: false },
          { question: 'How do I create my first project?', answer: 'To create your first project, go to the dashboard and click "New Project"...', isExpanded: false },
          { question: 'Is SiteGenie free to use?', answer: 'SiteGenie offers both free and paid plans. The free plan includes...', isExpanded: false },
        ];
      case '/api/support/tickets':
        return { success: true, message: 'Support ticket submitted successfully' };
      default:
        throw new Error('Invalid endpoint');
    }
  };

  const performSearch = useCallback(debounce(async (query: string) => {
    if (!query) {
      setSearchResults([]);
      return;
    }
    setIsLoading(true);
    try {
      const results = await mockApiCall('/api/help/search', { query });
      setSearchResults(results);
    } catch (err) {
      setError('Failed to perform search. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, 300), []);

  const fetchPopularTopics = async () => {
    try {
      const topics = await mockApiCall('/api/help/popular');
      setPopularTopics(topics);
    } catch (err) {
      setError('Failed to fetch popular topics. Please refresh the page.');
    }
  };

  const fetchFAQ = async () => {
    try {
      const faq = await mockApiCall('/api/help/faq');
      setFaqList(faq);
    } catch (err) {
      setError('Failed to fetch FAQ. Please refresh the page.');
    }
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    // In a real implementation, we would fetch articles for the selected category
  };

  const toggleFaqItem = (index: number) => {
    setFaqList(prevList => 
      prevList.map((item, i) => 
        i === index ? { ...item, isExpanded: !item.isExpanded } : item
      )
    );
  };

  const handleSupportTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await mockApiCall('/api/support/tickets', supportTicket);
      alert('Support ticket submitted successfully!');
      setSupportTicket({ subject: '', description: '', priority: 'normal', attachments: [] });
    } catch (err) {
      setError('Failed to submit support ticket. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const startLiveChat = () => {
    // In a real implementation, this would initiate a WebSocket connection
    alert('Live chat feature is not implemented in this demo.');
  };

  useEffect(() => {
    fetchPopularTopics();
    fetchFAQ();
  }, []);

  useEffect(() => {
    performSearch(searchQuery);
  }, [searchQuery, performSearch]);

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Help Center</h1>
        
        {/* Search Bar */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search for help..."
            className="w-full p-3 border border-gray-300 rounded-md"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Search Results */}
        {isLoading && <p>Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {searchResults.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Search Results</h2>
            <ul>
              {searchResults.map((result) => (
                <li key={result.id} className="mb-4">
                  <h3 className="text-lg font-semibold">{result.title}</h3>
                  <p>{result.excerpt}</p>
                  <span className="text-sm text-gray-500">{result.category}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Popular Topics */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Popular Topics</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {popularTopics.map((topic) => (
              <li key={topic.id} className="bg-gray-100 p-4 rounded-md">
                <h3 className="font-semibold">{topic.title}</h3>
                <span className="text-sm text-gray-500">{topic.views} views</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Category Browse */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Browse by Category</h2>
          <div className="flex flex-wrap gap-2">
            {['all', 'Getting Started', 'Account Management', 'Content Creation', 'SEO Optimization', 'Exporting/Publishing'].map((category) => (
              <button
                key={category}
                className={`px-4 py-2 rounded-md ${selectedCategory === category ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                onClick={() => handleCategorySelect(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Video Tutorials */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Video Tutorials</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Replace with actual video embeds or thumbnails */}
            <div className="aspect-w-16 aspect-h-9 bg-gray-300 rounded-md"></div>
            <div className="aspect-w-16 aspect-h-9 bg-gray-300 rounded-md"></div>
            <div className="aspect-w-16 aspect-h-9 bg-gray-300 rounded-md"></div>
          </div>
        </div>

        {/* FAQ Accordion */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqList.map((faq, index) => (
              <div key={index} className="border border-gray-200 rounded-md">
                <button
                  className="flex justify-between items-center w-full p-4 text-left"
                  onClick={() => toggleFaqItem(index)}
                >
                  <span className="font-semibold">{faq.question}</span>
                  <span>{faq.isExpanded ? '−' : '+'}</span>
                </button>
                {faq.isExpanded && (
                  <div className="p-4 bg-gray-50">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Support Ticket Form */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Submit a Support Ticket</h2>
          <form onSubmit={handleSupportTicketSubmit} className="space-y-4">
            <div>
              <label htmlFor="subject" className="block mb-1">Subject</label>
              <input
                type="text"
                id="subject"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={supportTicket.subject}
                onChange={(e) => setSupportTicket({ ...supportTicket, subject: e.target.value })}
                required
              />
            </div>
            <div>
              <label htmlFor="description" className="block mb-1">Description</label>
              <textarea
                id="description"
                className="w-full p-2 border border-gray-300 rounded-md"
                rows={4}
                value={supportTicket.description}
                onChange={(e) => setSupportTicket({ ...supportTicket, description: e.target.value })}
                required
              ></textarea>
            </div>
            <div>
              <label htmlFor="priority" className="block mb-1">Priority</label>
              <select
                id="priority"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={supportTicket.priority}
                onChange={(e) => setSupportTicket({ ...supportTicket, priority: e.target.value })}
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label htmlFor="attachments" className="block mb-1">Attachments</label>
              <input
                type="file"
                id="attachments"
                className="w-full p-2 border border-gray-300 rounded-md"
                multiple
                onChange={(e) => setSupportTicket({ ...supportTicket, attachments: Array.from(e.target.files || []) })}
              />
            </div>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              disabled={isLoading}
            >
              {isLoading ? 'Submitting...' : 'Submit Ticket'}
            </button>
          </form>
        </div>

        {/* Live Chat Button */}
        <div>
          <button
            onClick={startLiveChat}
            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
          >
            Start Live Chat
          </button>
        </div>

        {/* Community Forum Link */}
        <div className="mt-8">
          <Link to="/community" className="text-blue-500 hover:underline">
            Visit our Community Forum
          </Link>
        </div>
      </div>
    </>
  );
};

export default UV_HelpCenter;