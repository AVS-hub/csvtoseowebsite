import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store/main';
import axios from 'axios';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import debounce from 'lodash/debounce';
import { Search, PlusCircle, ChevronRight, Save, Image, Loader2 } from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
  const [searchPages, setSearchPages] = useState("");

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

  const handleSeoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      <div className="flex h-screen bg-gray-100">
        {/* Left Sidebar */}
        <div className="w-60 bg-white shadow-md overflow-y-auto">
          <h2 className="text-xl font-semibold p-4">Pages</h2>
          <div className="px-4 mb-4">
            <Input
              type="text"
              placeholder="Search pages"
              value={searchPages}
              onChange={(e) => setSearchPages(e.target.value)}
              className="w-full"
              icon={<Search className="h-4 w-4" />}
            />
          </div>
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Page 1</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <NavigationMenuLink>Subpage 1</NavigationMenuLink>
                  <NavigationMenuLink>Subpage 2</NavigationMenuLink>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Page 2</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <NavigationMenuLink>Subpage 3</NavigationMenuLink>
                  <NavigationMenuLink>Subpage 4</NavigationMenuLink>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
          <div className="p-4">
            <Button className="w-full">
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Page
            </Button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-3xl mx-auto">
            <Input
              type="text"
              value={pageContent?.title || ''}
              onChange={(e) => setPageContent(prev => prev ? { ...prev, title: e.target.value } : null)}
              className="text-3xl font-bold mb-4"
              placeholder="Page Title"
            />
            <Input
              type="text"
              value={pageContent?.url_slug || ''}
              onChange={(e) => setPageContent(prev => prev ? { ...prev, url_slug: e.target.value } : null)}
              className="mb-4"
              placeholder="URL Slug"
            />
            <div className="mb-4 flex items-center justify-between">
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">B</Button>
                <Button variant="outline" size="sm">I</Button>
                <Button variant="outline" size="sm">U</Button>
              </div>
              <Button variant="outline" onClick={generateAIContent}>
                <ChevronRight className="mr-2 h-4 w-4" /> Generate AI Content
              </Button>
            </div>
            <ReactQuill
              value={pageContent?.content || ''}
              onChange={handleContentChange}
              className="h-96 mb-4"
            />
            <div className="flex items-center space-x-4 mb-4">
              <Button onClick={() => setShowMediaLibrary(true)}>
                <Image className="mr-2 h-4 w-4" /> Insert Media
              </Button>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex space-x-4">
                <Button onClick={savePage}>
                  <Save className="mr-2 h-4 w-4" /> Save
                </Button>
                <Button variant="secondary">Publish</Button>
                <Button variant="secondary">Preview</Button>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Autosaving...
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-60 bg-white shadow-md overflow-y-auto p-4">
          <h2 className="text-xl font-semibold mb-4">SEO Settings</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="meta_title" className="block text-sm font-medium text-gray-700">Meta Title</label>
              <Input
                type="text"
                id="meta_title"
                name="meta_title"
                value={seoMetadata?.meta_title || ''}
                onChange={handleSeoChange}
              />
            </div>
            <div>
              <label htmlFor="meta_description" className="block text-sm font-medium text-gray-700">Meta Description</label>
              <Textarea
                id="meta_description"
                name="meta_description"
                value={seoMetadata?.meta_description || ''}
                onChange={handleSeoChange}
                rows={3}
              />
            </div>
            <div>
              <label htmlFor="focus_keyword" className="block text-sm font-medium text-gray-700">Focus Keyword</label>
              <Input
                type="text"
                id="focus_keyword"
                name="focus_keyword"
                value={seoMetadata?.focus_keyword || ''}
                onChange={handleSeoChange}
              />
            </div>
            <div>
              <span className="block text-sm font-medium text-gray-700">SEO Score</span>
              <Progress value={seoMetadata?.seo_score || 0} className="mt-2" />
              <span className="text-sm text-gray-500">{seoMetadata?.seo_score || 0}/100</span>
            </div>
          </div>

          <Accordion type="single" collapsible className="mt-6">
            <AccordionItem value="item-1">
              <AccordionTrigger>SEO Recommendations</AccordionTrigger>
              <AccordionContent>
                <ul className="list-disc pl-4 text-sm">
                  <li>Improve meta description</li>
                  <li>Add more content</li>
                  <li>Use focus keyword in headings</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

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
        </div>
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
            <Button onClick={() => setShowMediaLibrary(false)} className="mt-4">
              Close
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default UV_ContentEditor;