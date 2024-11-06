import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store/main';
import axios from 'axios';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import debounce from 'lodash/debounce';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Search, Settings, Save, Send } from 'lucide-react';

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
      <div className="flex h-screen overflow-hidden bg-gray-100">
        {/* Left Sidebar - Page Selection */}
        <div className="w-64 bg-white p-4 overflow-y-auto border-r">
          <div className="mb-4">
            <Input type="text" placeholder="Search pages" className="w-full" icon={<Search className="w-4 h-4" />} />
          </div>
          <div className="space-y-2">
            {/* Implement page list here */}
            <div className="p-2 bg-gray-100 rounded">Page 1</div>
            <div className="p-2 hover:bg-gray-100 rounded">Page 2</div>
            <div className="p-2 hover:bg-gray-100 rounded">Page 3</div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Editor Toolbar */}
          <div className="bg-white border-b p-4 flex justify-between items-center">
            <Input
              type="text"
              value={pageContent.title}
              onChange={(e) => setPageContent(prev => prev ? { ...prev, title: e.target.value } : null)}
              className="text-2xl font-bold w-1/2"
            />
            <div className="space-x-2">
              <Button onClick={savePage} variant="outline"><Save className="w-4 h-4 mr-2" /> Save</Button>
              <Button onClick={generateAIContent}><Send className="w-4 h-4 mr-2" /> Generate AI Content</Button>
            </div>
          </div>

          {/* WYSIWYG Editor */}
          <div className="flex-1 overflow-y-auto p-4 bg-white">
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
              className="h-full"
            />
          </div>

          {/* Action Bar */}
          <div className="bg-white border-t p-4 flex justify-between items-center">
            <div>
              <span className="text-sm text-gray-500">Words: {pageContent.content.split(/\s+/).length}</span>
            </div>
            <div className="space-x-2">
              <Button variant="secondary">Preview</Button>
              <Button>Publish</Button>
            </div>
          </div>
        </div>

        {/* Right Sidebar - SEO and Version History */}
        <div className="w-80 bg-white p-4 overflow-y-auto border-l">
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-4">SEO</h2>
            {seoMetadata && (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-lg font-semibold">SEO Score</span>
                  <div className="relative w-16 h-16">
                    <svg className="w-full h-full" viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="3"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#4ade80"
                        strokeWidth="3"
                        strokeDasharray={`${seoMetadata.seo_score}, 100`}
                      />
                      <text x="18" y="20.35" className="text-xs font-bold" textAnchor="middle" fill="#4ade80">
                        {seoMetadata.seo_score}%
                      </text>
                    </svg>
                  </div>
                </div>
                <Input
                  type="text"
                  value={seoMetadata.meta_title}
                  onChange={(e) => setSeoMetadata(prev => prev ? { ...prev, meta_title: e.target.value } : null)}
                  placeholder="Meta Title"
                  className="mb-2"
                />
                <Textarea
                  value={seoMetadata.meta_description}
                  onChange={(e) => setSeoMetadata(prev => prev ? { ...prev, meta_description: e.target.value } : null)}
                  placeholder="Meta Description"
                  className="mb-2"
                />
                <Input
                  type="text"
                  value={seoMetadata.focus_keyword}
                  onChange={(e) => setSeoMetadata(prev => prev ? { ...prev, focus_keyword: e.target.value } : null)}
                  placeholder="Focus Keyword"
                  className="mb-2"
                />
                <Button onClick={analyzeSEO} className="w-full"><Settings className="w-4 h-4 mr-2" /> Analyze SEO</Button>
              </>
            )}
          </div>
          <Accordion type="single" collapsible className="mb-6">
            <AccordionItem value="seo-recommendations">
              <AccordionTrigger>SEO Recommendations</AccordionTrigger>
              <AccordionContent>
                <ul className="list-disc pl-4 space-y-2">
                  <li>Include your focus keyword in the first paragraph.</li>
                  <li>Add more internal links to improve site structure.</li>
                  <li>Optimize your meta description for better click-through rates.</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <div>
            <h2 className="text-xl font-bold mb-4">Version History</h2>
            <div className="space-y-4">
              {versionHistory.map(version => (
                <div key={version.version_id} className="bg-gray-50 p-3 rounded">
                  <p className="font-semibold">{new Date(version.timestamp).toLocaleString()}</p>
                  <p className="text-sm text-gray-600">{version.author}</p>
                  <p className="text-sm mt-1">{version.summary}</p>
                </div>
              ))}
            </div>
            <Link to="#" className="text-blue-500 hover:underline mt-4 inline-block">View all versions</Link>
          </div>
        </div>
      </div>

      {/* Last saved indicator */}
      <div className="fixed bottom-4 right-4 bg-white shadow-md rounded-md px-4 py-2 text-sm text-gray-600">
        Last saved: {pageContent.last_saved ? new Date(pageContent.last_saved).toLocaleTimeString() : 'Never'}
      </div>
    </>
  );
};

export default UV_ContentEditor;