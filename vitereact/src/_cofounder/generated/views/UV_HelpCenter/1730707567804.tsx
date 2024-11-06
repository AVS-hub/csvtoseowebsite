import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { debounce } from 'lodash';
import { RootState } from '@/store/main';

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
      setFaqList(response.data.map((faq: { question: string; answer: string }) => ({ ...faq, isExpanded: false })));
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

  const toggleFaqItem = (index: number) => {
    setFaqList(faqList.map((item, i) => 
      i === index ? { ...item, isExpanded: !item.isExpanded } : item
    ));
  };

  const handleSupportTicketChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setSupportTicket({ ...supportTicket, [e.target.name]: e.target.value });
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
          formData.append(key, value);
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
      // Here you would typically initiate a WebSocket connection
      // and handle the chat UI, but for this example, we'll just show an alert
      alert(`Chat session initiated. Session ID: ${response.data.sessionId}`);
    } catch (err) {
      console.error('Error starting live chat:', err);
      setError('Failed to start live chat');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Help Center</h1>

      {/* Search Bar */}
      <div className="mb-8">
        <input
          type="text"
          placeholder="Search for help..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full p-2 border rounded"
        />
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Search Results</h2>
          <ul>
            {searchResults.map((result) => (
              <li key={result.id} className="mb-4">
                <h3 className="text-lg font-medium">{result.title}</h3>
                <p>{result.excerpt}</p>
                <span className="text-sm text-gray-500">{result.category}</span>
                <div className="mt-2">
                  <button onClick={() => rateArticle(result.id, 1)} className="mr-2 text-green-500">Helpful</button>
                  <button onClick={() => rateArticle(result.id, 0)} className="text-red-500">Not Helpful</button>
                </div>
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
            <li key={topic.id} className="bg-gray-100 p-4 rounded">
              <Link to={`/help/topic/${topic.id}`} className="text-blue-600 hover:underline">{topic.title}</Link>
              <span className="text-sm text-gray-500 block">Views: {topic.views}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Category Browse */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Browse by Category</h2>
        <div className="flex flex-wrap gap-2">
          {['all', 'getting-started', 'account', 'content-creation', 'seo', 'exporting'].map((category) => (
            <button
              key={category}
              onClick={() => selectCategory(category)}
              className={`px-4 py-2 rounded ${selectedCategory === category ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Frequently Asked Questions</h2>
        <div className="space-y-2">
          {faqList.map((faq, index) => (
            <div key={index} className="border rounded">
              <button
                onClick={() => toggleFaqItem(index)}
                className="w-full text-left p-4 font-medium focus:outline-none"
              >
                {faq.question}
                <span className="float-right">{faq.isExpanded ? '−' : '+'}</span>
              </button>
              {faq.isExpanded && <div className="p-4 bg-gray-50">{faq.answer}</div>}
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
              className="w-full p-2 border rounded"
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
              className="w-full p-2 border rounded"
              rows={4}
            ></textarea>
          </div>
          <div>
            <label htmlFor="priority" className="block mb-1">Priority</label>
            <select
              id="priority"
              name="priority"
              value={supportTicket.priority}
              onChange={handleSupportTicketChange}
              className="w-full p-2 border rounded"
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
              onChange={handleFileUpload}
              multiple
              className="w-full p-2 border rounded"
            />
          </div>
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Submit Ticket
          </button>
        </form>
      </div>

      {/* Live Chat Button */}
      <div>
        <button onClick={startLiveChat} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
          Start Live Chat
        </button>
      </div>

      {/* Loading and Error States */}
      {isLoading && <div className="text-center mt-4">Loading...</div>}
      {error && <div className="text-red-500 mt-4">{error}</div>}
    </div>
  );
};

export default UV_HelpCenter;