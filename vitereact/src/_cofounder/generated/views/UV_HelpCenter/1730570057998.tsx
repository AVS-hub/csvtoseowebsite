import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import axios from 'axios';
import debounce from 'lodash/debounce';
import { RootState } from '@/store/main';

const UV_HelpCenter: React.FC = () => {
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
  const [isLiveChatAvailable, setIsLiveChatAvailable] = useState<boolean>(false);

  const userAuth = useSelector((state: RootState) => state.user_auth);
  const userProfile = useSelector((state: RootState) => state.user_profile);

  const performSearch = useCallback(
    debounce(async (query: string) => {
      try {
        const response = await axios.get(`http://localhost:1337/api/help/search?query=${query}`);
        setSearchResults(response.data);
      } catch (error) {
        console.error('Error performing search:', error);
      }
    }, 300),
    []
  );

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.length > 2) {
      performSearch(query);
    } else {
      setSearchResults([]);
    }
  };

  const selectCategory = async (category: string) => {
    setSelectedCategory(category);
    try {
      const response = await axios.get(`http://localhost:1337/api/help/articles?category=${category}`);
      setSearchResults(response.data);
    } catch (error) {
      console.error('Error fetching category articles:', error);
    }
  };

  const toggleFaqItem = (index: number) => {
    setFaqList(faqList.map((item, i) => 
      i === index ? { ...item, isExpanded: !item.isExpanded } : item
    ));
  };

  const handleSupportTicketChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSupportTicket(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSupportTicket(prev => ({ ...prev, attachments: [...prev.attachments, ...Array.from(e.target.files as FileList)] }));
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

      const response = await axios.post('http://localhost:1337/api/support/tickets', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${userAuth.token}`,
        },
      });
      console.log('Support ticket submitted:', response.data);
      // Reset form or show success message
    } catch (error) {
      console.error('Error submitting support ticket:', error);
    }
  };

  const rateArticle = async (articleId: string, rating: number) => {
    try {
      await axios.post(`http://localhost:1337/api/help/articles/${articleId}/rate`, { rating }, {
        headers: { Authorization: `Bearer ${userAuth.token}` },
      });
      // Update UI to reflect the new rating
    } catch (error) {
      console.error('Error rating article:', error);
    }
  };

  const startLiveChat = async () => {
    try {
      const response = await axios.post('http://localhost:1337/api/support/chat', {}, {
        headers: { Authorization: `Bearer ${userAuth.token}` },
      });
      // Handle chat session initiation (e.g., open chat window, connect to WebSocket)
      console.log('Live chat session initiated:', response.data);
    } catch (error) {
      console.error('Error starting live chat:', error);
    }
  };

  useEffect(() => {
    const fetchPopularTopics = async () => {
      try {
        const response = await axios.get('http://localhost:1337/api/help/popular-topics');
        setPopularTopics(response.data);
      } catch (error) {
        console.error('Error fetching popular topics:', error);
      }
    };

    const fetchFaqList = async () => {
      try {
        const response = await axios.get('http://localhost:1337/api/help/faq');
        setFaqList(response.data.map((item: { question: string; answer: string }) => ({ ...item, isExpanded: false })));
      } catch (error) {
        console.error('Error fetching FAQ list:', error);
      }
    };

    const checkLiveChatAvailability = async () => {
      try {
        const response = await axios.get('http://localhost:1337/api/support/chat/availability');
        setIsLiveChatAvailable(response.data.available);
      } catch (error) {
        console.error('Error checking live chat availability:', error);
      }
    };

    fetchPopularTopics();
    fetchFaqList();
    checkLiveChatAvailability();
  }, []);

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Help Center</h1>
        
        {/* Search Bar */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search for help..."
            value={searchQuery}
            onChange={handleSearchInputChange}
            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Search Results</h2>
            <ul className="space-y-4">
              {searchResults.map((result) => (
                <li key={result.id} className="bg-white p-4 rounded-md shadow">
                  <h3 className="font-semibold text-lg">{result.title}</h3>
                  <p className="text-gray-600">{result.excerpt}</p>
                  <span className="text-sm text-blue-600">{result.category}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Popular Topics */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Popular Topics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {popularTopics.map((topic) => (
              <div key={topic.id} className="bg-white p-4 rounded-md shadow">
                <h3 className="font-semibold">{topic.title}</h3>
                <span className="text-sm text-gray-500">{topic.views} views</span>
              </div>
            ))}
          </div>
        </div>

        {/* Category Browse */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Browse by Category</h2>
          <div className="flex flex-wrap gap-2">
            {['all', 'getting-started', 'account', 'content-creation', 'seo', 'export-publish'].map((category) => (
              <button
                key={category}
                onClick={() => selectCategory(category)}
                className={`px-4 py-2 rounded-md ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                {category.replace('-', ' ').charAt(0).toUpperCase() + category.replace('-', ' ').slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Video Tutorials */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Video Tutorials</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {/* Placeholder for video tutorials */}
            {[1, 2, 3].map((index) => (
              <div key={index} className="bg-gray-200 aspect-video rounded-md flex items-center justify-center">
                <span className="text-gray-500">Video {index}</span>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Accordion */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
          <div className="space-y-2">
            {faqList.map((faq, index) => (
              <div key={index} className="border border-gray-200 rounded-md">
                <button
                  className="w-full text-left px-4 py-2 font-semibold flex justify-between items-center"
                  onClick={() => toggleFaqItem(index)}
                >
                  {faq.question}
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
          <h2 className="text-xl font-semibold mb-4">Submit a Support Ticket</h2>
          <form onSubmit={submitSupportTicket} className="space-y-4">
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                Subject
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={supportTicket.subject}
                onChange={handleSupportTicketChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={supportTicket.description}
                onChange={handleSupportTicketChange}
                required
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              ></textarea>
            </div>
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                Priority
              </label>
              <select
                id="priority"
                name="priority"
                value={supportTicket.priority}
                onChange={handleSupportTicketChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label htmlFor="attachments" className="block text-sm font-medium text-gray-700">
                Attachments
              </label>
              <input
                type="file"
                id="attachments"
                name="attachments"
                onChange={handleFileUpload}
                multiple
                className="mt-1 block w-full"
              />
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Submit Ticket
            </button>
          </form>
        </div>

        {/* Live Chat */}
        {isLiveChatAvailable && (
          <div className="mb-8">
            <button
              onClick={startLiveChat}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Start Live Chat
            </button>
          </div>
        )}

        {/* Community Forum Link */}
        <div>
          <Link to="/community-forum" className="text-blue-600 hover:underline">
            Visit our Community Forum for user-to-user support and knowledge sharing
          </Link>
        </div>
      </div>
    </>
  );
};

export default UV_HelpCenter;