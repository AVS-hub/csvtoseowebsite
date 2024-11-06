import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store/main';
import axios from 'axios';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import debounce from 'lodash/debounce';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const api = axios.create({
    baseURL: 'http://localhost:1337/api',
    headers: { Authorization: `Bearer ${userAuth.token}` }
  });

  const loadPageContent = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/projects/${project_id}/pages/${page_id}`);
      setPageContent(response.data);
      setSeoMetadata(response.data.seo_metadata);
      setLoading(false);
    } catch (err) {
      setError('Failed to load page content. Please try again.');
      setLoading(false);
    }
  }, [project_id, page_id, api]);

  const savePage = useCallback(async () => {
    if (!pageContent) return;
    try {
      await api.put(`/projects/${project_id}/pages/${page_id}`, {
        ...pageContent,
        seo_metadata: seoMetadata
      });
      setPageContent(prev => prev ? { ...prev, last_saved: Date.now() } : null);
    } catch (err) {
      setError('Failed to save page. Please try again.');
    }
  }, [project_id, page_id, api, pageContent, seoMetadata]);

  const debouncedSavePage = debounce(savePage, 5000);

  const generateAIContent = async () => {
    try {
      const response = await api.post(`/projects/${project_id}/pages/${page_id}/generate`, {
        prompt: pageContent?.title
      });
      setPageContent(prev => prev ? { ...prev, content: response.data.content } : null);
    } catch (err) {
      setError('Failed to generate AI content. Please try again.');
    }
  };

  const analyzeSEO = async () => {
    try {
      const response = await api.post(`/projects/${project_id}/pages/${page_id}/analyze-seo`, {
        content: pageContent?.content,
        meta_title: seoMetadata?.meta_title,
        meta_description: seoMetadata?.meta_description,
        focus_keyword: seoMetadata?.focus_keyword
      });
      setSeoMetadata(prev => prev ? { ...prev, seo_score: response.data.seo_score } : null);
    } catch (err) {
      setError('Failed to analyze SEO. Please try again.');
    }
  };

  const uploadMedia = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post(`/projects/${project_id}/media`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMediaLibrary(prev => [...prev, response.data]);
    } catch (err) {
      setError('Failed to upload media. Please try again.');
    }
  };

  useEffect(() => {
    loadPageContent();
  }, [loadPageContent]);

  useEffect(() => {
    if (pageContent) {
      debouncedSavePage();
    }
  }, [pageContent, debouncedSavePage]);

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (error) return <div className="text-red-500 text-center">{error}</div>;
  if (!pageContent) return <div className="text-center">No page content found.</div>;

  return (
    <>
      <div className="flex h-screen overflow-hidden">
        {/* Page Selection Sidebar */}
        <div className="w-64 bg-gray-100 p-4 overflow-y-auto">
          <h2 className="text-xl font-bold mb-4">Pages</h2>
          {/* Implement page list here */}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Editor Toolbar */}
          <div className="bg-white border-b p-4 flex justify-between items-center">
            <input
              type="text"
              value={pageContent.title}
              onChange={(e) => setPageContent(prev => prev ? { ...prev, title: e.target.value } : null)}
              className="text-2xl font-bold w-1/2"
            />
            <div>
              <button onClick={savePage} className="bg-blue-500 text-white px-4 py-2 rounded mr-2">Save</button>
              <button onClick={generateAIContent} className="bg-green-500 text-white px-4 py-2 rounded">Generate AI Content</button>
            </div>
          </div>

          {/* WYSIWYG Editor */}
          <div className="flex-1 overflow-y-auto p-4">
            <ReactQuill
              value={pageContent.content}
              onChange={(content) => setPageContent(prev => prev ? { ...prev, content } : null)}
              modules={{
                toolbar: [
                  [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                  ['bold', 'italic', 'underline', 'strike'],
                  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                  ['link', 'image'],
                  ['clean']
                ],
              }}
            />
          </div>
        </div>

        {/* SEO Panel */}
        <div className="w-80 bg-gray-100 p-4 overflow-y-auto">
          <h2 className="text-xl font-bold mb-4">SEO</h2>
          {seoMetadata && (
            <>
              <input
                type="text"
                value={seoMetadata.meta_title}
                onChange={(e) => setSeoMetadata(prev => prev ? { ...prev, meta_title: e.target.value } : null)}
                placeholder="Meta Title"
                className="w-full mb-2 p-2"
              />
              <textarea
                value={seoMetadata.meta_description}
                onChange={(e) => setSeoMetadata(prev => prev ? { ...prev, meta_description: e.target.value } : null)}
                placeholder="Meta Description"
                className="w-full mb-2 p-2 h-20"
              />
              <input
                type="text"
                value={seoMetadata.focus_keyword}
                onChange={(e) => setSeoMetadata(prev => prev ? { ...prev, focus_keyword: e.target.value } : null)}
                placeholder="Focus Keyword"
                className="w-full mb-2 p-2"
              />
              <div className="mb-4">SEO Score: {seoMetadata.seo_score}</div>
              <button onClick={analyzeSEO} className="bg-blue-500 text-white px-4 py-2 rounded w-full">Analyze SEO</button>
            </>
          )}
        </div>
      </div>

      {/* Media Library Modal (implement show/hide logic) */}
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" style={{ display: 'none' }}>
        <div className="bg-white p-4 rounded-lg w-2/3 h-2/3 overflow-y-auto">
          <h2 className="text-xl font-bold mb-4">Media Library</h2>
          <div className="grid grid-cols-3 gap-4">
            {mediaLibrary.map(media => (
              <div key={media.id} className="border p-2">
                <img src={media.thumbnail_url} alt={media.name} className="w-full h-32 object-cover" />
                <p className="mt-2 text-sm">{media.name}</p>
              </div>
            ))}
          </div>
          <input type="file" onChange={(e) => e.target.files && uploadMedia(e.target.files[0])} className="mt-4" />
        </div>
      </div>

      {/* Version History Panel (implement show/hide logic) */}
      <div className="fixed right-0 top-0 h-full w-64 bg-white shadow-lg p-4 overflow-y-auto" style={{ display: 'none' }}>
        <h2 className="text-xl font-bold mb-4">Version History</h2>
        {versionHistory.map(version => (
          <div key={version.version_id} className="mb-2">
            <p className="font-bold">{new Date(version.timestamp).toLocaleString()}</p>
            <p>{version.author}</p>
            <p className="text-sm">{version.summary}</p>
          </div>
        ))}
      </div>
    </>
  );
};

export default UV_ContentEditor;