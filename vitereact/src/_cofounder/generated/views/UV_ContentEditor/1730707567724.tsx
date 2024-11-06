import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store/main';
import axios from 'axios';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import debounce from 'lodash/debounce';

const UV_ContentEditor: React.FC = () => {
  const { project_id, page_id } = useParams<{ project_id: string; page_id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const userAuth = useSelector((state: RootState) => state.user_auth);
  const currentProject = useSelector((state: RootState) => state.current_project);

  const [pageContent, setPageContent] = useState<{
    title: string;
    url_slug: string;
    content: string;
    last_saved: number;
  } | null>(null);
  const [seoMetadata, setSeoMetadata] = useState<{
    meta_title: string;
    meta_description: string;
    focus_keyword: string;
    seo_score: number;
  } | null>(null);
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
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);

  const loadPageContent = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`http://localhost:1337/api/projects/${project_id}/pages/${page_id}`, {
        headers: { Authorization: `Bearer ${userAuth.token}` },
      });
      setPageContent(response.data);
      setSeoMetadata(response.data.seo_metadata);
      setVersionHistory(response.data.version_history);
    } catch (err) {
      setError('Failed to load page content. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [project_id, page_id, userAuth.token]);

  useEffect(() => {
    loadPageContent();
  }, [loadPageContent]);

  const savePage = useCallback(async () => {
    if (!pageContent) return;
    try {
      await axios.put(`http://localhost:1337/api/projects/${project_id}/pages/${page_id}`, {
        ...pageContent,
        seo_metadata: seoMetadata,
      }, {
        headers: { Authorization: `Bearer ${userAuth.token}` },
      });
      setPageContent(prev => prev ? { ...prev, last_saved: Date.now() } : null);
    } catch (err) {
      setError('Failed to save page. Please try again.');
    }
  }, [project_id, page_id, pageContent, seoMetadata, userAuth.token]);

  const debouncedSave = useCallback(debounce(savePage, 5000), [savePage]);

  useEffect(() => {
    if (pageContent) {
      debouncedSave();
    }
  }, [pageContent, debouncedSave]);

  const handleContentChange = (content: string) => {
    setPageContent(prev => prev ? { ...prev, content } : null);
  };

  const handleSeoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSeoMetadata(prev => prev ? { ...prev, [name]: value } : null);
  };

  const generateAIContent = async () => {
    try {
      const response = await axios.post(`http://localhost:1337/api/projects/${project_id}/pages/${page_id}/generate`, {}, {
        headers: { Authorization: `Bearer ${userAuth.token}` },
      });
      setPageContent(prev => prev ? { ...prev, content: response.data.content } : null);
    } catch (err) {
      setError('Failed to generate AI content. Please try again.');
    }
  };

  const analyzeSEO = useCallback(debounce(async () => {
    if (!pageContent) return;
    try {
      const response = await axios.post(`http://localhost:1337/api/projects/${project_id}/pages/${page_id}/analyze-seo`, {
        content: pageContent.content,
        ...seoMetadata,
      }, {
        headers: { Authorization: `Bearer ${userAuth.token}` },
      });
      setSeoMetadata(prev => prev ? { ...prev, seo_score: response.data.seo_score } : null);
    } catch (err) {
      console.error('Failed to analyze SEO');
    }
  }, 1000), [project_id, page_id, pageContent, seoMetadata, userAuth.token]);

  useEffect(() => {
    if (pageContent && seoMetadata) {
      analyzeSEO();
    }
  }, [pageContent, seoMetadata, analyzeSEO]);

  const uploadMedia = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await axios.post(`http://localhost:1337/api/projects/${project_id}/media`, formData, {
        headers: { 
          'Authorization': `Bearer ${userAuth.token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setMediaLibrary(prev => [...prev, response.data]);
    } catch (err) {
      setError('Failed to upload media. Please try again.');
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <>
      <div className="flex flex-col h-screen">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">
              {pageContent?.title || 'Untitled Page'}
            </h1>
            <div className="flex space-x-4">
              <button
                onClick={savePage}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                Save
              </button>
              <Link
                to={`/projects/${project_id}`}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
              >
                Back to Project
              </Link>
            </div>
          </div>
        </header>

        <main className="flex-grow flex">
          <div className="flex-grow p-6">
            <ReactQuill
              value={pageContent?.content || ''}
              onChange={handleContentChange}
              modules={{
                toolbar: [
                  [{ 'header': [1, 2, 3, false] }],
                  ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                  [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
                  ['link', 'image'],
                  ['clean']
                ],
              }}
            />
            <div className="mt-4 flex justify-between">
              <button
                onClick={generateAIContent}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
              >
                Generate AI Content
              </button>
              <button
                onClick={() => setShowMediaLibrary(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
              >
                Media Library
              </button>
            </div>
          </div>

          <aside className="w-80 bg-gray-100 p-6 overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">SEO Optimization</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="meta_title" className="block text-sm font-medium text-gray-700">
                  Meta Title
                </label>
                <input
                  type="text"
                  id="meta_title"
                  name="meta_title"
                  value={seoMetadata?.meta_title || ''}
                  onChange={handleSeoChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="meta_description" className="block text-sm font-medium text-gray-700">
                  Meta Description
                </label>
                <textarea
                  id="meta_description"
                  name="meta_description"
                  value={seoMetadata?.meta_description || ''}
                  onChange={handleSeoChange}
                  rows={3}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="focus_keyword" className="block text-sm font-medium text-gray-700">
                  Focus Keyword
                </label>
                <input
                  type="text"
                  id="focus_keyword"
                  name="focus_keyword"
                  value={seoMetadata?.focus_keyword || ''}
                  onChange={handleSeoChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-700">SEO Score</span>
                <div className="mt-1 flex items-center">
                  <span className="text-2xl font-bold">{seoMetadata?.seo_score || 0}</span>
                  <span className="ml-2 text-sm text-gray-500">/100</span>
                </div>
              </div>
            </div>

            <h2 className="text-xl font-semibold mt-8 mb-4">Version History</h2>
            <ul className="space-y-2">
              {versionHistory.map((version) => (
                <li key={version.version_id} className="text-sm">
                  <span className="font-medium">{new Date(version.timestamp).toLocaleString()}</span>
                  <br />
                  <span className="text-gray-500">{version.author}: {version.summary}</span>
                </li>
              ))}
            </ul>
          </aside>
        </main>
      </div>

      {showMediaLibrary && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-3/4 h-3/4 overflow-y-auto">
            <h2 className="text-2xl font-semibold mb-4">Media Library</h2>
            <div className="grid grid-cols-3 gap-4">
              {mediaLibrary.map((media) => (
                <div key={media.id} className="border rounded p-2">
                  <img src={media.thumbnail_url} alt={media.name} className="w-full h-32 object-cover" />
                  <p className="mt-2 text-sm truncate">{media.name}</p>
                </div>
              ))}
            </div>
            <input
              type="file"
              onChange={(e) => e.target.files && uploadMedia(e.target.files[0])}
              className="mt-4"
            />
            <button
              onClick={() => setShowMediaLibrary(false)}
              className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default UV_ContentEditor;