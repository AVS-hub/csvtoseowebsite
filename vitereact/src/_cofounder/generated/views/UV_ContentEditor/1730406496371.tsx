import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store/main';
import axios from 'axios';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { debounce } from 'lodash';
import { io } from 'socket.io-client';

const UV_ContentEditor: React.FC = () => {
  const { project_id, page_id } = useParams<{ project_id: string; page_id: string }>();
  const dispatch: AppDispatch = useDispatch();
  const userAuth = useSelector((state: RootState) => state.user_auth);
  const currentProject = useSelector((state: RootState) => state.current_project);

  const [pageContent, setPageContent] = useState<{
    title: string;
    url_slug: string;
    content: string;
    last_saved: number;
  }>({
    title: '',
    url_slug: '',
    content: '',
    last_saved: 0,
  });

  const [seoMetadata, setSeoMetadata] = useState<{
    meta_title: string;
    meta_description: string;
    focus_keyword: string;
    seo_score: number;
  }>({
    meta_title: '',
    meta_description: '',
    focus_keyword: '',
    seo_score: 0,
  });

  const [mediaLibrary, setMediaLibrary] = useState<Array<{
    id: string;
    type: string;
    url: string;
    thumbnail_url: string;
    name: string;
  }>>([]);

  const [versionHistory, setVersionHistory] = useState<Array<{
    version_id: string;
    timestamp: number;
    author: string;
    summary: string;
  }>>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load page content
  useEffect(() => {
    const fetchPageContent = async () => {
      try {
        const response = await axios.get(`http://localhost:1337/api/projects/${project_id}/pages/${page_id}`, {
          headers: { Authorization: `Bearer ${userAuth.token}` },
        });
        setPageContent(response.data);
        setSeoMetadata(response.data.seo_metadata);
        setIsLoading(false);
      } catch (err) {
        setError('Failed to load page content. Please try again.');
        setIsLoading(false);
      }
    };

    fetchPageContent();
  }, [project_id, page_id, userAuth.token]);

  // Autosave functionality
  const savePageContent = useCallback(debounce(async (content: typeof pageContent) => {
    try {
      await axios.put(`http://localhost:1337/api/projects/${project_id}/pages/${page_id}`, content, {
        headers: { Authorization: `Bearer ${userAuth.token}` },
      });
      setPageContent(prev => ({ ...prev, last_saved: Date.now() }));
    } catch (err) {
      setError('Failed to save changes. Please try again.');
    }
  }, 5000), [project_id, page_id, userAuth.token]);

  // Handle content changes
  const handleContentChange = (content: string) => {
    setPageContent(prev => ({ ...prev, content }));
    savePageContent({ ...pageContent, content });
  };

  // Generate AI content
  const generateAIContent = async () => {
    try {
      const response = await axios.post(`http://localhost:1337/api/projects/${project_id}/pages/${page_id}/generate`, {
        prompt: pageContent.title,
      }, {
        headers: { Authorization: `Bearer ${userAuth.token}` },
      });
      setPageContent(prev => ({ ...prev, content: response.data.content }));
    } catch (err) {
      setError('Failed to generate AI content. Please try again.');
    }
  };

  // Analyze SEO
  const analyzeSEO = async () => {
    try {
      const response = await axios.post(`http://localhost:1337/api/projects/${project_id}/pages/${page_id}/analyze-seo`, {
        content: pageContent.content,
        meta_title: seoMetadata.meta_title,
        meta_description: seoMetadata.meta_description,
        focus_keyword: seoMetadata.focus_keyword,
      }, {
        headers: { Authorization: `Bearer ${userAuth.token}` },
      });
      setSeoMetadata(prev => ({ ...prev, seo_score: response.data.seo_score }));
    } catch (err) {
      setError('Failed to analyze SEO. Please try again.');
    }
  };

  // Upload media
  const uploadMedia = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await axios.post(`http://localhost:1337/api/projects/${project_id}/media`, formData, {
        headers: { 
          Authorization: `Bearer ${userAuth.token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setMediaLibrary(prev => [...prev, response.data]);
    } catch (err) {
      setError('Failed to upload media. Please try again.');
    }
  };

  // Real-time collaboration
  useEffect(() => {
    const socket = io('http://localhost:1337', {
      query: { token: userAuth.token },
    });

    socket.on('connect', () => {
      console.log('Connected to WebSocket');
      socket.emit('join_page', { project_id, page_id });
    });

    socket.on('content_update', (updatedContent) => {
      setPageContent(prev => ({ ...prev, ...updatedContent }));
    });

    return () => {
      socket.disconnect();
    };
  }, [project_id, page_id, userAuth.token]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center h-screen text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Content Editor</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <input
            type="text"
            value={pageContent.title}
            onChange={(e) => setPageContent(prev => ({ ...prev, title: e.target.value }))}
            className="w-full mb-4 p-2 border rounded"
            placeholder="Page Title"
          />
          <input
            type="text"
            value={pageContent.url_slug}
            onChange={(e) => setPageContent(prev => ({ ...prev, url_slug: e.target.value }))}
            className="w-full mb-4 p-2 border rounded"
            placeholder="URL Slug"
          />
          <ReactQuill
            value={pageContent.content}
            onChange={handleContentChange}
            className="h-64 mb-4"
          />
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={generateAIContent}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Generate AI Content
            </button>
            <span className="text-sm text-gray-500">
              Last saved: {new Date(pageContent.last_saved).toLocaleString()}
            </span>
          </div>
        </div>
        <div>
          <h2 className="text-xl font-bold mb-4">SEO Optimization</h2>
          <input
            type="text"
            value={seoMetadata.meta_title}
            onChange={(e) => setSeoMetadata(prev => ({ ...prev, meta_title: e.target.value }))}
            className="w-full mb-2 p-2 border rounded"
            placeholder="Meta Title"
          />
          <textarea
            value={seoMetadata.meta_description}
            onChange={(e) => setSeoMetadata(prev => ({ ...prev, meta_description: e.target.value }))}
            className="w-full mb-2 p-2 border rounded"
            placeholder="Meta Description"
          />
          <input
            type="text"
            value={seoMetadata.focus_keyword}
            onChange={(e) => setSeoMetadata(prev => ({ ...prev, focus_keyword: e.target.value }))}
            className="w-full mb-2 p-2 border rounded"
            placeholder="Focus Keyword"
          />
          <button
            onClick={analyzeSEO}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 w-full mb-2"
          >
            Analyze SEO
          </button>
          <div className="text-center">
            <span className="text-lg font-bold">SEO Score: {seoMetadata.seo_score}</span>
          </div>
        </div>
      </div>
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Media Library</h2>
        <input
          type="file"
          onChange={(e) => e.target.files && uploadMedia(e.target.files[0])}
          className="mb-4"
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {mediaLibrary.map((media) => (
            <div key={media.id} className="border p-2 rounded">
              <img src={media.thumbnail_url} alt={media.name} className="w-full h-32 object-cover mb-2" />
              <p className="text-sm truncate">{media.name}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Version History</h2>
        <ul>
          {versionHistory.map((version) => (
            <li key={version.version_id} className="mb-2">
              <span className="font-bold">{new Date(version.timestamp).toLocaleString()}</span> - {version.summary} by {version.author}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default UV_ContentEditor;