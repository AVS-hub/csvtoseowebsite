import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { RootState } from '@/store/main';
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

  const userAuth = useSelector((state: RootState) => state.user_auth);
  const userProfile = useSelector((state: RootState) => state.user_profile);

  const api = axios.create({
    baseURL: 'http://localhost:1337/api',
    headers: { Authorization: `Bearer ${userAuth.token}` }
  });

  const performSearch = useCallback(debounce(async (query: string) => {
    try {
      const response = await api.get('/help/search', { params: { query } });
      setSearchResults(response.data);
    } catch (error) {
      console.error('Error searching help articles:', error);
    }
  }, 300), [api]);

  useEffect(() => {
    const fetchPopularTopics = async () => {
      try {
        const response = await api.get('/help/popular-topics');
        setPopularTopics(response.data);
      } catch (error) {
        console.error('Error fetching popular topics:', error);
      }
    };

    const fetchFAQs = async () => {
      try {
        const response = await api.get('/help/faqs');
        setFaqList(response.data.map((faq: any) => ({ ...faq, isExpanded: false })));
      } catch (error) {
        console.error('Error fetching FAQs:', error);
      }
    };

    fetchPopularTopics();
    fetchFAQs();
  }, [api]);

  useEffect(() => {
    if (searchQuery) {
      performSearch(searchQuery);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, performSearch]);

  const handleCategorySelect = async (category: string) => {
    setSelectedCategory(category);
    try {
      const response = await api.get('/help/articles', { params: { category } });
      setSearchResults(response.data);
    } catch (error) {
      console.error('Error fetching category articles:', error);
    }
  };

  const toggleFaqItem = (index: number) => {
    setFaqList(faqList.map((faq, i) => 
      i === index ? { ...faq, isExpanded: !faq.isExpanded } : faq
    ));
  };

  const handleSupportTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.entries(supportTicket).forEach(([key, value]) => {
        if (key === 'attachments') {
          value.forEach((file: File) => formData.append('attachments', file));
        } else {
          formData.append(key, value);
        }
      });
      await api.post('/support/tickets', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Support ticket submitted successfully!');
      setSupportTicket({
        subject: '',
        description: '',
        priority: 'normal',
        attachments: []
      });
    } catch (error) {
      console.error('Error submitting support ticket:', error);
      alert('Failed to submit support ticket. Please try again.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSupportTicket(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...Array.from(e.target.files as FileList)]
      }));
    }
  };

  const startLiveChat = async () => {
    try {
      const response = await api.post('/support/chat');
      // Implement WebSocket connection here using response data
      console.log('Live chat initiated:', response.data);
      alert('Live chat initiated. An agent will be with you shortly.');
    } catch (error) {
      console.error('Error starting live chat:', error);
      alert('Failed to start live chat. Please try again later.');
    }
  };

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Help Center</h1>

        {/* Search Bar */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search for help..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Search Results</h2>
            <ul className="space-y-4">
              {searchResults.map((result) => (
                <li key={result.id} className="border-b pb-4">
                  <h3 className="text-lg font-medium">{result.title}</h3>
                  <p className="text-gray-600">{result.excerpt}</p>
                  <span className="text-sm text-blue-500">{result.category}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Popular Topics */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Popular Topics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {popularTopics.map((topic) => (
              <div key={topic.id} className="bg-gray-100 p-4 rounded-md">
                <h3 className="text-lg font-medium">{topic.title}</h3>
                <p className="text-sm text-gray-500">{topic.views} views</p>
              </div>
            ))}
          </div>
        </div>

        {/* Category Browse */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Browse by Category</h2>
          <div className="flex flex-wrap gap-2">
            {['all', 'getting-started', 'account-management', 'content-creation', 'seo-optimization', 'exporting-publishing'].map((category) => (
              <button
                key={category}
                onClick={() => handleCategorySelect(category)}
                className={`px-4 py-2 rounded-md ${
                  selectedCategory === category ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
                }`}
              >
                {category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqList.map((faq, index) => (
              <div key={index} className="border-b pb-4">
                <button
                  onClick={() => toggleFaqItem(index)}
                  className="flex justify-between items-center w-full text-left"
                  aria-expanded={faq.isExpanded}
                >
                  <span className="text-lg font-medium">{faq.question}</span>
                  <span className="text-2xl">{faq.isExpanded ? '−' : '+'}</span>
                </button>
                {faq.isExpanded && (
                  <p className="mt-2 text-gray-600">{faq.answer}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Video Tutorials */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Video Tutorials</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {/* Placeholder for video tutorials */}
            {[1, 2, 3].map((index) => (
              <div key={index} className="aspect-w-16 aspect-h-9">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?controls=0`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={`Video Tutorial ${index}`}
                ></iframe>
              </div>
            ))}
          </div>
        </div>

        {/* Support Ticket Form */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Submit a Support Ticket</h2>
          <form onSubmit={handleSupportTicketSubmit} className="space-y-4">
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Subject</label>
              <input
                type="text"
                id="subject"
                value={supportTicket.subject}
                onChange={(e) => setSupportTicket(prev => ({ ...prev, subject: e.target.value }))}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                id="description"
                value={supportTicket.description}
                onChange={(e) => setSupportTicket(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              ></textarea>
            </div>
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700">Priority</label>
              <select
                id="priority"
                value={supportTicket.priority}
                onChange={(e) => setSupportTicket(prev => ({ ...prev, priority: e.target.value }))}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label htmlFor="attachments" className="block text-sm font-medium text-gray-700">Attachments</label>
              <input
                type="file"
                id="attachments"
                onChange={handleFileChange}
                multiple
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
            <button type="submit" className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              Submit Ticket
            </button>
          </form>
        </div>

        {/* Live Chat Button */}
        <div className="text-center">
          <button
            onClick={startLiveChat}
            className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Start Live Chat
          </button>
        </div>

        {/* Community Forum Link */}
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Can't find what you're looking for? Visit our{' '}
            <Link to="/community" className="text-blue-500 hover:underline">Community Forum</Link>
            {' '}for user-to-user support and knowledge sharing.
          </p>
        </div>
      </div>
    </>
  );
};

export default UV_HelpCenter;