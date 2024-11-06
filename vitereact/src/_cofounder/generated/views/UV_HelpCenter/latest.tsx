import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store/main';
import axios from 'axios';
import { debounce } from 'lodash';
import { Link } from 'react-router-dom';

const UV_HelpCenter: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const { is_authenticated, token } = useSelector((state: RootState) => state.user_auth);
  const userProfile = useSelector((state: RootState) => state.user_profile);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Array<{ id: string; title: string; excerpt: string; category: string }>>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [popularTopics, setPopularTopics] = useState<Array<{ id: string; title: string; views: number }>>([]);
  const [faqList, setFaqList] = useState<Array<{ question: string; answer: string; isExpanded: boolean }>>([]);
  const [supportTicket, setSupportTicket] = useState<{ subject: string; description: string; priority: string; attachments: File[] }>({
    subject: '',
    description: '',
    priority: 'normal',
    attachments: [],
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const api = axios.create({
    baseURL: 'http://localhost:1337/api',
    headers: { Authorization: `Bearer ${token}` },
  });

  const performSearch = useCallback(
    debounce(async (query: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.get(`/help/search?query=${encodeURIComponent(query)}`);
        setSearchResults(response.data);
      } catch (err) {
        setError('Failed to perform search. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }, 300),
    [api]
  );

  const fetchPopularTopics = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get('/help/popular-topics');
      setPopularTopics(response.data);
    } catch (err) {
      setError('Failed to fetch popular topics. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFAQ = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get('/help/faq');
      setFaqList(response.data.map((item: any) => ({ ...item, isExpanded: false })));
    } catch (err) {
      setError('Failed to fetch FAQ. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPopularTopics();
    fetchFAQ();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      performSearch(searchQuery);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, performSearch]);

  const handleCategorySelect = async (category: string) => {
    setSelectedCategory(category);
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get(`/help/articles?category=${category}`);
      setSearchResults(response.data);
    } catch (err) {
      setError('Failed to fetch articles. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFaqItem = (index: number) => {
    setFaqList(faqList.map((item, i) => 
      i === index ? { ...item, isExpanded: !item.isExpanded } : item
    ));
  };

  const handleSupportTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!is_authenticated) {
      setError('You must be logged in to submit a support ticket.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('subject', supportTicket.subject);
      formData.append('description', supportTicket.description);
      formData.append('priority', supportTicket.priority);
      supportTicket.attachments.forEach((file) => {
        formData.append('attachments', file);
      });
      await api.post('/support/tickets', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSupportTicket({ subject: '', description: '', priority: 'normal', attachments: [] });
      alert('Support ticket submitted successfully!');
    } catch (err) {
      setError('Failed to submit support ticket. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleArticleRating = async (articleId: string, rating: number) => {
    if (!is_authenticated) {
      setError('You must be logged in to rate articles.');
      return;
    }
    try {
      await api.post(`/help/articles/${articleId}/rate`, { rating });
      alert('Thank you for your feedback!');
    } catch (err) {
      setError('Failed to submit rating. Please try again.');
    }
  };

  const startLiveChat = async () => {
    if (!is_authenticated) {
      setError('You must be logged in to start a live chat.');
      return;
    }
    try {
      const response = await api.post('/support/chat');
      // Implement WebSocket connection here using the response data
      alert('Live chat initiated. A support agent will be with you shortly.');
    } catch (err) {
      setError('Failed to initiate live chat. Please try again.');
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
          className="w-full p-2 border rounded"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Search Results</h2>
          <ul>
            {searchResults.map((result) => (
              <li key={result.id} className="mb-4">
                <h3 className="text-xl font-semibold">{result.title}</h3>
                <p>{result.excerpt}</p>
                <span className="text-sm text-gray-500">{result.category}</span>
                <div className="mt-2">
                  <button onClick={() => handleArticleRating(result.id, 1)} className="mr-2 text-green-500">Helpful</button>
                  <button onClick={() => handleArticleRating(result.id, 0)} className="text-red-500">Not Helpful</button>
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
            <div key={topic.id} className="p-4 border rounded">
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
          {['all', 'Getting Started', 'Account Management', 'Content Creation', 'SEO Optimization', 'Exporting/Publishing'].map((category) => (
            <button
              key={category}
              onClick={() => handleCategorySelect(category)}
              className={`px-4 py-2 rounded ${selectedCategory === category ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Frequently Asked Questions</h2>
        {faqList.map((faq, index) => (
          <div key={index} className="mb-4">
            <button
              onClick={() => toggleFaqItem(index)}
              className="flex justify-between items-center w-full text-left p-4 bg-gray-100 rounded"
            >
              <span>{faq.question}</span>
              <span>{faq.isExpanded ? '−' : '+'}</span>
            </button>
            {faq.isExpanded && <p className="mt-2 p-4 bg-gray-50">{faq.answer}</p>}
          </div>
        ))}
      </div>

      {/* Support Ticket Form */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Submit a Support Ticket</h2>
        {is_authenticated ? (
          <form onSubmit={handleSupportTicketSubmit}>
            <div className="mb-4">
              <label htmlFor="subject" className="block mb-2">Subject</label>
              <input
                type="text"
                id="subject"
                value={supportTicket.subject}
                onChange={(e) => setSupportTicket({ ...supportTicket, subject: e.target.value })}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="description" className="block mb-2">Description</label>
              <textarea
                id="description"
                value={supportTicket.description}
                onChange={(e) => setSupportTicket({ ...supportTicket, description: e.target.value })}
                className="w-full p-2 border rounded"
                rows={4}
                required
              ></textarea>
            </div>
            <div className="mb-4">
              <label htmlFor="priority" className="block mb-2">Priority</label>
              <select
                id="priority"
                value={supportTicket.priority}
                onChange={(e) => setSupportTicket({ ...supportTicket, priority: e.target.value })}
                className="w-full p-2 border rounded"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="mb-4">
              <label htmlFor="attachments" className="block mb-2">Attachments</label>
              <input
                type="file"
                id="attachments"
                onChange={(e) => setSupportTicket({ ...supportTicket, attachments: Array.from(e.target.files || []) })}
                className="w-full p-2 border rounded"
                multiple
              />
            </div>
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded" disabled={isLoading}>
              {isLoading ? 'Submitting...' : 'Submit Ticket'}
            </button>
          </form>
        ) : (
          <p>Please <Link to="/login" className="text-blue-500">log in</Link> to submit a support ticket.</p>
        )}
      </div>

      {/* Live Chat Button */}
      <div className="mb-8">
        <button onClick={startLiveChat} className="bg-green-500 text-white px-4 py-2 rounded" disabled={!is_authenticated || isLoading}>
          Start Live Chat
        </button>
      </div>

      {/* Error Display */}
      {error && <div className="text-red-500 mb-4">{error}</div>}

      {/* Loading Indicator */}
      {isLoading && <div className="text-center">Loading...</div>}
    </div>
  );
};

export default UV_HelpCenter;