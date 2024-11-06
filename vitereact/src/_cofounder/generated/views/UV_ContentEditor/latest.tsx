import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store/main';
import axios from 'axios';
import { Editor } from 'react-draft-wysiwyg';
import { EditorState, convertToRaw, convertFromRaw } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';
import debounce from 'lodash/debounce';

const UV_ContentEditor: React.FC = () => {
  const { project_id, page_id } = useParams<{ project_id: string; page_id: string }>();
  const dispatch: AppDispatch = useDispatch();
  const userAuth = useSelector((state: RootState) => state.user_auth);
  const currentProject = useSelector((state: RootState) => state.current_project);

  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [pageTitle, setPageTitle] = useState('');
  const [urlSlug, setUrlSlug] = useState('');
  const [lastSaved, setLastSaved] = useState<number | null>(null);
  const [seoMetadata, setSeoMetadata] = useState({
    meta_title: '',
    meta_description: '',
    focus_keyword: '',
    seo_score: 0
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

  const api = axios.create({
    baseURL: 'http://localhost:1337/api',
    headers: { Authorization: `Bearer ${userAuth.token}` }
  });

  const loadPageContent = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/projects/${project_id}/pages/${page_id}`);
      const { title, url_slug, content, seo_metadata, version_history } = response.data;
      
      setPageTitle(title);
      setUrlSlug(url_slug);
      const contentState = htmlToDraft(content);
      setEditorState(EditorState.createWithContent(contentState));
      setSeoMetadata(seo_metadata);
      setVersionHistory(version_history);
      setLastSaved(Date.now());
      setIsLoading(false);
    } catch (err) {
      setError('Failed to load page content. Please try again.');
      setIsLoading(false);
    }
  }, [api, project_id, page_id]);

  const savePage = useCallback(async () => {
    try {
      const content = draftToHtml(convertToRaw(editorState.getCurrentContent()));
      await api.put(`/projects/${project_id}/pages/${page_id}`, {
        title: pageTitle,
        url_slug: urlSlug,
        content,
        seo_metadata: seoMetadata
      });
      setLastSaved(Date.now());
    } catch (err) {
      setError('Failed to save page. Please try again.');
    }
  }, [api, project_id, page_id, pageTitle, urlSlug, editorState, seoMetadata]);

  const debouncedSave = useCallback(debounce(savePage, 5000), [savePage]);

  const generateAIContent = async () => {
    try {
      const response = await api.post(`/projects/${project_id}/pages/${page_id}/generate`, {
        prompt: pageTitle
      });
      const generatedContent = response.data.content;
      const contentState = htmlToDraft(generatedContent);
      setEditorState(EditorState.createWithContent(contentState));
    } catch (err) {
      setError('Failed to generate AI content. Please try again.');
    }
  };

  const analyzeSEO = useCallback(async () => {
    try {
      const content = draftToHtml(convertToRaw(editorState.getCurrentContent()));
      const response = await api.post(`/projects/${project_id}/pages/${page_id}/analyze-seo`, {
        content,
        meta_title: seoMetadata.meta_title,
        meta_description: seoMetadata.meta_description,
        focus_keyword: seoMetadata.focus_keyword
      });
      setSeoMetadata(prevState => ({ ...prevState, seo_score: response.data.seo_score }));
    } catch (err) {
      setError('Failed to analyze SEO. Please try again.');
    }
  }, [api, project_id, page_id, editorState, seoMetadata]);

  const debouncedAnalyzeSEO = useCallback(debounce(analyzeSEO, 2000), [analyzeSEO]);

  const uploadMedia = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post(`/projects/${project_id}/media`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMediaLibrary(prevState => [...prevState, response.data]);
    } catch (err) {
      setError('Failed to upload media. Please try again.');
    }
  };

  useEffect(() => {
    loadPageContent();
  }, [loadPageContent]);

  useEffect(() => {
    debouncedSave();
    debouncedAnalyzeSEO();
  }, [editorState, pageTitle, urlSlug, seoMetadata, debouncedSave, debouncedAnalyzeSEO]);

  const handleEditorChange = (newEditorState: EditorState) => {
    setEditorState(newEditorState);
  };

  const handleSeoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSeoMetadata(prevState => ({ ...prevState, [name]: value }));
  };

  if (isLoading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (error) return <div className="text-red-500 text-center">{error}</div>;

  return (
    <>
      <div className="flex h-screen overflow-hidden">
        <div className="w-64 bg-gray-100 p-4 overflow-y-auto">
          <h2 className="text-xl font-bold mb-4">Pages</h2>
          {/* Implement page list here */}
        </div>
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="bg-white shadow-sm p-4">
            <input
              type="text"
              value={pageTitle}
              onChange={(e) => setPageTitle(e.target.value)}
              className="text-2xl font-bold w-full mb-2"
              placeholder="Page Title"
            />
            <input
              type="text"
              value={urlSlug}
              onChange={(e) => setUrlSlug(e.target.value)}
              className="text-sm text-gray-500 w-full"
              placeholder="URL Slug"
            />
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <Editor
              editorState={editorState}
              onEditorStateChange={handleEditorChange}
              wrapperClassName="border rounded-lg"
              editorClassName="p-4 min-h-[300px]"
              toolbar={{
                options: ['inline', 'blockType', 'list', 'textAlign', 'link', 'image', 'history'],
                inline: { inDropdown: true },
                list: { inDropdown: true },
                textAlign: { inDropdown: true },
                link: { inDropdown: true },
                history: { inDropdown: true },
              }}
            />
          </div>
          <div className="bg-gray-100 p-4 flex justify-between items-center">
            <div>
              {lastSaved && (
                <span className="text-sm text-gray-500">
                  Last saved: {new Date(lastSaved).toLocaleTimeString()}
                </span>
              )}
            </div>
            <div>
              <button
                onClick={generateAIContent}
                className="bg-blue-500 text-white px-4 py-2 rounded mr-2 hover:bg-blue-600"
              >
                Generate AI Content
              </button>
              <button
                onClick={savePage}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
        <div className="w-80 bg-gray-100 p-4 overflow-y-auto">
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">SEO</h3>
            <input
              type="text"
              name="meta_title"
              value={seoMetadata.meta_title}
              onChange={handleSeoChange}
              className="w-full p-2 mb-2 border rounded"
              placeholder="Meta Title"
            />
            <textarea
              name="meta_description"
              value={seoMetadata.meta_description}
              onChange={handleSeoChange}
              className="w-full p-2 mb-2 border rounded"
              placeholder="Meta Description"
            />
            <input
              type="text"
              name="focus_keyword"
              value={seoMetadata.focus_keyword}
              onChange={handleSeoChange}
              className="w-full p-2 mb-2 border rounded"
              placeholder="Focus Keyword"
            />
            <div className="bg-white p-2 rounded">
              <span className="font-semibold">SEO Score: </span>
              <span className={`${seoMetadata.seo_score >= 70 ? 'text-green-500' : 'text-red-500'}`}>
                {seoMetadata.seo_score}
              </span>
            </div>
          </div>
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Media Library</h3>
            <input
              type="file"
              onChange={(e) => e.target.files && uploadMedia(e.target.files[0])}
              className="mb-2"
            />
            <div className="grid grid-cols-2 gap-2">
              {mediaLibrary.map((media) => (
                <div key={media.id} className="bg-white p-2 rounded">
                  <img src={media.thumbnail_url} alt={media.name} className="w-full h-24 object-cover mb-1" />
                  <p className="text-xs truncate">{media.name}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Version History</h3>
            {versionHistory.map((version) => (
              <div key={version.version_id} className="bg-white p-2 rounded mb-2">
                <p className="text-sm font-semibold">{new Date(version.timestamp).toLocaleString()}</p>
                <p className="text-xs text-gray-500">{version.author}</p>
                <p className="text-sm">{version.summary}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default UV_ContentEditor;