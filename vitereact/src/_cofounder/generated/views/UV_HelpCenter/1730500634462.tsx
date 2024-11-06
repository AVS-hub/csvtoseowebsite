import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { debounce } from 'lodash';
import { RootState } from '@/store/main';

const UV_HelpCenter: React.FC = () => {
  // Local state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ id: string; title: string; excerpt: string; category: string }>>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [popularTopics, setPopularTopics] = useState<Array<{ id: string; title: string; views: number }>>([]);
  const [faqList, setFaqList] = useState<Array<{ question: string; answer: string; isExpanded: boolean }>>([]);
  const [supportTicket, setSupportTicket] = useState({
    subject: '',
    description: '',
    priority: 'normal',
    attachments: [] as File[],
  });
  const [isLiveChatAvailable, setIsLiveChatAvailable] = useState(false);
  const [ws, setWs] = useState<WebSocket | null>(null);

  // Global state
  const userAuth = useSelector((state: RootState) => state.user_auth);
  const userProfile = useSelector((state: RootState) => state.user_profile);

  // API calls
  const api = axios.create({
    baseURL: 'http://localhost:1337/api',
    headers: {
      Authorization: `Bearer ${userAuth.token}`,
    },
  });

  const fetchPopularTopics = async () => {
    try {
      const response = await api.get('/help/popular-topics');
      setPopularTopics(response.data);
    } catch (error) {
      console.error('Error fetching popular topics:', error);
    }
  };

  const fetchFAQ = async () => {
    try {
      const response = await api.get('/help/faq');
      setFaqList(response.data.map((item: any) => ({ ...item, isExpanded: false })));
    } catch (error) {
      console.error('Error fetching FAQ:', error);
    }
  };

  const performSearch = async (query: string) => {
    try {
      const response = await api.get(`/help/search?query=${encodeURIComponent(query)}`);
      setSearchResults(response.data);
    } catch (error) {
      console.error('Error performing search:', error);
    }
  };

  const debouncedSearch = useCallback(debounce(performSearch, 300), []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    debouncedSearch(e.target.value);
  };

  const selectCategory = async (category: string) => {
    setSelectedCategory(category);
    try {
      const response = await api.get(`/help/articles?category=${category}`);
      setSearchResults(response.data);
    } catch (error) {
      console.error('Error fetching articles by category:', error);
    }
  };

  const toggleFaqItem = (index: number) => {
    setFaqList(faqList.map((item, i) => 
      i === index ? { ...item, isExpanded: !item.isExpanded } : item
    ));
  };

  const handleSupportTicketChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setSupportTicket({ ...supportTicket, [e.target.name]: e.target.value });
  };

  const handleFileAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSupportTicket({ ...supportTicket, attachments: Array.from(e.target.files) });
    }
  };

  const submitSupportTicket = async (e: React.FormEvent) => {
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
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('Support ticket submitted successfully!');
      setSupportTicket({ subject: '', description: '', priority: 'normal', attachments: [] });
    } catch (error) {
      console.error('Error submitting support ticket:', error);
      alert('Failed to submit support ticket. Please try again.');
    }
  };

  const rateArticle = async (articleId: string, rating: number) => {
    try {
      await api.post(`/help/articles/${articleId}/rate`, { rating });
      alert('Thank you for your feedback!');
    } catch (error) {
      console.error('Error rating article:', error);
    }
  };

  const startLiveChat = () => {
    const socket = new WebSocket('ws://localhost:1337/ws/support-chat');
    socket.onopen = () => {
      console.log('WebSocket connection established');
      setWs(socket);
    };
    socket.onmessage = (event) => {
      console.log('Received message:', event.data);
      // Handle incoming messages here
    };
    socket.onclose = () => {
      console.log('WebSocket connection closed');
      setWs(null);
    };
  };

  useEffect(() => {
    fetchPopularTopics();
    fetchFAQ();
    // Check if live chat is available
    api.get('/support/chat-availability').then(response => {
      setIsLiveChatAvailable(response.data.available);
    });
  }, []);

  useEffect(() => {
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [ws]);

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Help Center</h1>

        {/* Search Bar */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search for help..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Search Results</h2>
            <ul className="space-y-4">
              {searchResults.map((result) => (
                <li key={result.id} className="bg-white p-4 rounded-lg shadow">
                  <h3 className="text-lg font-semibold">{result.title}</h3>
                  <p className="text-gray-600">{result.excerpt}</p>
                  <span className="text-sm text-blue-500">{result.category}</span>
                  <div className="mt-2">
                    <button onClick={() => rateArticle(result.id, 1)} className="mr-2 text-green-500">👍</button>
                    <button onClick={() => rateArticle(result.id, -1)} className="text-red-500">👎</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Popular Topics */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Popular Topics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {popularTopics.map((topic) => (
              <div key={topic.id} className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold">{topic.title}</h3>
                <p className="text-sm text-gray-500">{topic.views} views</p>
              </div>
            ))}
          </div>
        </div>

        {/* Category Browse */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Browse by Category</h2>
          <div className="flex flex-wrap gap-2">
            {['all', 'getting-started', 'account', 'content-creation', 'seo', 'export-publish'].map((category) => (
              <button
                key={category}
                onClick={() => selectCategory(category)}
                className={`px-4 py-2 rounded-full ${
                  selectedCategory === category ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
                }`}
              >
                {category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Video Tutorials */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Video Tutorials</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Placeholder for video tutorials */}
            <div className="bg-gray-200 aspect-video rounded-lg flex items-center justify-center">
              <span className="text-gray-500">Video Tutorial 1</span>
            </div>
            <div className="bg-gray-200 aspect-video rounded-lg flex items-center justify-center">
              <span className="text-gray-500">Video Tutorial 2</span>
            </div>
            <div className="bg-gray-200 aspect-video rounded-lg flex items-center justify-center">
              <span className="text-gray-500">Video Tutorial 3</span>
            </div>
          </div>
        </div>

        {/* FAQ Accordion */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Frequently Asked Questions</h2>
          <div className="space-y-2">
            {faqList.map((faq, index) => (
              <div key={index} className="border border-gray-200 rounded-lg">
                <button
                  className="flex justify-between items-center w-full px-4 py-2 text-left"
                  onClick={() => toggleFaqItem(index)}
                  aria-expanded={faq.isExpanded}
                >
                  <span className="font-semibold">{faq.question}</span>
                  <span>{faq.isExpanded ? '−' : '+'}</span>
                </button>
                {faq.isExpanded && (
                  <div className="px-4 py-2 bg-gray-50">
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
          <form onSubmit={submitSupportTicket} className="space-y-4">
            <div>
              <label htmlFor="subject" className="block mb-1">Subject</label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={supportTicket.subject}
                onChange={handleSupportTicketChange}
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300"
              />
            </div>
            <div>
              <label htmlFor="description" className="block mb-1">Description</label>
              <textarea
                id="description"
                name="description"
                value={supportTicket.description}
                onChange={handleSupportTicketChange}
                required
                rows={4}
                className="w-full px-4 py-2 rounded-lg border border-gray-300"
              ></textarea>
            </div>
            <div>
              <label htmlFor="priority" className="block mb-1">Priority</label>
              <select
                id="priority"
                name="priority"
                value={supportTicket.priority}
                onChange={handleSupportTicketChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300"
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
                name="attachments"
                onChange={handleFileAttachment}
                multiple
                className="w-full px-4 py-2 rounded-lg border border-gray-300"
              />
            </div>
            <button type="submit" className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
              Submit Ticket
            </button>
          </form>
        </div>

        {/* Live Chat */}
        {isLiveChatAvailable && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Live Chat</h2>
            {ws ? (
              <div className="bg-white p-4 rounded-lg shadow">
                <p>Chat session active. Implement chat UI here.</p>
                <button onClick={() => ws.close()} className="mt-2 px-4 py-2 bg-red-500 text-white rounded-lg">
                  End Chat
                </button>
              </div>
            ) : (
              <button onClick={startLiveChat} className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
                Start Live Chat
              </button>
            )}
          </div>
        )}

        {/* Community Forum Link */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Community Forum</h2>
          <Link to="/forum" className="text-blue-500 hover:underline">
            Visit our community forum for user-to-user support and knowledge sharing
          </Link>
        </div>
      </div>
    </>
  );
};

export default UV_HelpCenter;