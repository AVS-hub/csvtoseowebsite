import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store/main';
import axios from 'axios';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { debounce } from 'lodash';

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

  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const api = axios.create({
    baseURL: 'http://localhost:1337/api',
    headers: { Authorization: `Bearer ${userAuth.token}` },
  });

  const loadPageContent = useCallback(async () => {
    try {
      const response = await api.get(`/projects/${project_id}/pages/${page_id}`);
      setPageContent(response.data);
      setSeoMetadata(response.data.seo_metadata);
    } catch (error) {
      setError('Failed to load page content. Please try again.');
    }
  }, [api, project_id, page_id]);

  const savePageContent = useCallback(async () => {
    setIsSaving(true);
    try {
      await api.put(`/projects/${project_id}/pages/${page_id}`, {
        ...pageContent,
        seo_metadata: seoMetadata,
      });
      setPageContent(prev => ({ ...prev, last_saved: Date.now() }));
    } catch (error) {
      setError('Failed to save page content. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [api, project_id, page_id, pageContent, seoMetadata]);

  const debouncedSave = useCallback(debounce(savePageContent, 5000), [savePageContent]);

  const generateAIContent = async () => {
    try {
      const response = await api.post(`/projects/${project_id}/pages/${page_id}/generate`, {
        prompt: pageContent.title,
      });
      setPageContent(prev => ({ ...prev, content: response.data.content }));
    } catch (error) {
      setError('Failed to generate AI content. Please try again.');
    }
  };

  const analyzeSEO = useCallback(debounce(async () => {
    try {
      const response = await api.post(`/projects/${project_id}/pages/${page_id}/analyze-seo`, {
        content: pageContent.content,
        meta_title: seoMetadata.meta_title,
        meta_description: seoMetadata.meta_description,
        focus_keyword: seoMetadata.focus_keyword,
      });
      setSeoMetadata(prev => ({ ...prev, seo_score: response.data.seo_score }));
    } catch (error) {
      setError('Failed to analyze SEO. Please try again.');
    }
  }, 1000), [api, project_id, page_id, pageContent, seoMetadata]);

  const uploadMedia = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await api.post(`/projects/${project_id}/media`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMediaLibrary(prev => [...prev, response.data]);
    } catch (error) {
      setError('Failed to upload media. Please try again.');
    }
  };

  useEffect(() => {
    loadPageContent();
  }, [loadPageContent]);

  useEffect(() => {
    debouncedSave();
    analyzeSEO();
  }, [pageContent, seoMetadata, debouncedSave, analyzeSEO]);

  return (
    <>
      <div className="flex h-screen overflow-hidden">
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <input
              type="text"
              value={pageContent.title}
              onChange={(e) => setPageContent(prev => ({ ...prev, title: e.target.value }))}
              className="w-full text-3xl font-bold mb-4 p-2 border rounded"
              placeholder="Page Title"
            />
            <ReactQuill
              value={pageContent.content}
              onChange={(content) => setPageContent(prev => ({ ...prev, content }))}
              className="h-[calc(100vh-200px)] mb-4"
            />
            <div className="flex justify-between items-center">
              <button
                onClick={generateAIContent}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Generate AI Content
              </button>
              <span className="text-sm text-gray-500">
                {isSaving ? 'Saving...' : `Last saved: ${new Date(pageContent.last_saved).toLocaleString()}`}
              </span>
            </div>
          </div>
        </div>
        <div className="w-80 bg-gray-100 p-6 overflow-auto">
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
            rows={3}
          />
          <input
            type="text"
            value={seoMetadata.focus_keyword}
            onChange={(e) => setSeoMetadata(prev => ({ ...prev, focus_keyword: e.target.value }))}
            className="w-full mb-2 p-2 border rounded"
            placeholder="Focus Keyword"
          />
          <div className="mb-4">
            <span className="font-bold">SEO Score: </span>
            <span className={`${seoMetadata.seo_score >= 70 ? 'text-green-500' : 'text-red-500'}`}>
              {seoMetadata.seo_score}
            </span>
          </div>
          <button
            onClick={() => setIsMediaModalOpen(true)}
            className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mb-2"
          >
            Open Media Library
          </button>
          <button
            onClick={() => setIsVersionHistoryOpen(true)}
            className="w-full bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
          >
            View Version History
          </button>
        </div>
      </div>

      {isMediaModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-3/4 h-3/4 overflow-auto">
            <h2 className="text-2xl font-bold mb-4">Media Library</h2>
            <div className="grid grid-cols-4 gap-4">
              {mediaLibrary.map((media) => (
                <div key={media.id} className="border rounded p-2">
                  <img src={media.thumbnail_url} alt={media.name} className="w-full h-32 object-cover mb-2" />
                  <p className="text-sm truncate">{media.name}</p>
                </div>
              ))}
            </div>
            <input
              type="file"
              onChange={(e) => e.target.files && uploadMedia(e.target.files[0])}
              className="mt-4"
            />
            <button
              onClick={() => setIsMediaModalOpen(false)}
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {isVersionHistoryOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-3/4 h-3/4 overflow-auto">
            <h2 className="text-2xl font-bold mb-4">Version History</h2>
            <ul>
              {versionHistory.map((version) => (
                <li key={version.version_id} className="mb-2 p-2 border rounded">
                  <p><strong>Author:</strong> {version.author}</p>
                  <p><strong>Timestamp:</strong> {new Date(version.timestamp).toLocaleString()}</p>
                  <p><strong>Summary:</strong> {version.summary}</p>
                </li>
              ))}
            </ul>
            <button
              onClick={() => setIsVersionHistoryOpen(false)}
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded">
          {error}
          <button onClick={() => setError(null)} className="ml-2 font-bold">×</button>
        </div>
      )}
    </>
  );
};

export default UV_ContentEditor;