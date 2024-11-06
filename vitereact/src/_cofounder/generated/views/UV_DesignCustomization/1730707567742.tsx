import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { RootState, AppDispatch } from '@/store/main';
import { debounce } from 'lodash';

const UV_DesignCustomization: React.FC = () => {
  const { project_id } = useParams<{ project_id: string }>();
  const dispatch: AppDispatch = useDispatch();
  const { token } = useSelector((state: RootState) => state.user_auth);
  const currentProject = useSelector((state: RootState) => state.current_project);

  const [selectedTheme, setSelectedTheme] = useState<{
    theme_id: string;
    name: string;
    thumbnail_url: string;
  } | null>(null);
  const [colorScheme, setColorScheme] = useState<{
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  } | null>(null);
  const [typography, setTypography] = useState<{
    headings_font: string;
    body_font: string;
    base_font_size: number;
    line_height: number;
  } | null>(null);
  const [layoutOptions, setLayoutOptions] = useState<{
    header_style: string;
    footer_style: string;
    sidebar_position: string;
    content_width: string;
  } | null>(null);
  const [customCSS, setCustomCSS] = useState('');
  const [customJS, setCustomJS] = useState('');
  const [isMobilePreview, setIsMobilePreview] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const api = useMemo(() => axios.create({
    baseURL: 'http://localhost:1337/api',
    headers: { Authorization: `Bearer ${token}` }
  }), [token]);

  const loadDesignSettings = useCallback(async () => {
    try {
      const response = await api.get(`/projects/${project_id}/design`);
      const { theme, colors, typography, layout, custom_code } = response.data;
      setSelectedTheme(theme);
      setColorScheme(colors);
      setTypography(typography);
      setLayoutOptions(layout);
      setCustomCSS(custom_code.css);
      setCustomJS(custom_code.js);
    } catch (err) {
      setError('Failed to load design settings. Please try again.');
    }
  }, [api, project_id]);

  useEffect(() => {
    loadDesignSettings();
  }, [loadDesignSettings]);

  const updateDesignSetting = useCallback(async (endpoint: string, data: any) => {
    try {
      await api.put(`/projects/${project_id}/design/${endpoint}`, data);
    } catch (err) {
      setError(`Failed to update ${endpoint}. Please try again.`);
    }
  }, [api, project_id]);

  const debouncedUpdateDesignSetting = useMemo(
    () => debounce(updateDesignSetting, 500),
    [updateDesignSetting]
  );

  const handleThemeChange = useCallback((theme: typeof selectedTheme) => {
    setSelectedTheme(theme);
    debouncedUpdateDesignSetting('theme', theme);
  }, [debouncedUpdateDesignSetting]);

  const handleColorChange = useCallback((colorKey: keyof typeof colorScheme, value: string) => {
    setColorScheme(prev => ({ ...prev!, [colorKey]: value }));
    debouncedUpdateDesignSetting('colors', { ...colorScheme, [colorKey]: value });
  }, [colorScheme, debouncedUpdateDesignSetting]);

  const handleTypographyChange = useCallback((key: keyof typeof typography, value: string | number) => {
    setTypography(prev => ({ ...prev!, [key]: value }));
    debouncedUpdateDesignSetting('typography', { ...typography, [key]: value });
  }, [typography, debouncedUpdateDesignSetting]);

  const handleLayoutChange = useCallback((key: keyof typeof layoutOptions, value: string) => {
    setLayoutOptions(prev => ({ ...prev!, [key]: value }));
    debouncedUpdateDesignSetting('layout', { ...layoutOptions, [key]: value });
  }, [layoutOptions, debouncedUpdateDesignSetting]);

  const handleCustomCodeSave = useCallback(() => {
    debouncedUpdateDesignSetting('custom-code', { css: customCSS, js: customJS });
  }, [customCSS, customJS, debouncedUpdateDesignSetting]);

  const previewStyles = useMemo(() => `
    ${customCSS}
    body {
      font-family: ${typography?.body_font};
      font-size: ${typography?.base_font_size}px;
      line-height: ${typography?.line_height};
      color: ${colorScheme?.text};
      background-color: ${colorScheme?.background};
    }
    h1, h2, h3, h4, h5, h6 {
      font-family: ${typography?.headings_font};
    }
  `, [customCSS, typography, colorScheme]);

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Design Customization</h1>
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">{error}</div>}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-8">
            {/* Theme Selection */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Theme Selection</h2>
              <div className="grid grid-cols-3 gap-4">
                {/* This is a placeholder. In a real scenario, you'd map over available themes */}
                <button
                  className={`p-2 border rounded ${selectedTheme?.theme_id === 'theme1' ? 'border-blue-500' : 'border-gray-300'}`}
                  onClick={() => handleThemeChange({ theme_id: 'theme1', name: 'Modern', thumbnail_url: 'https://picsum.photos/seed/theme1/100/100' })}
                >
                  <img src="https://picsum.photos/seed/theme1/100/100" alt="Modern Theme" className="w-full h-auto" />
                  <span>Modern</span>
                </button>
                {/* Add more theme options here */}
              </div>
            </section>

            {/* Color Scheme */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Color Scheme</h2>
              <div className="space-y-2">
                {colorScheme && Object.entries(colorScheme).map(([key, value]) => (
                  <div key={key} className="flex items-center">
                    <label htmlFor={`color-${key}`} className="w-1/3 capitalize">{key}</label>
                    <input
                      type="color"
                      id={`color-${key}`}
                      value={value}
                      onChange={(e) => handleColorChange(key as keyof typeof colorScheme, e.target.value)}
                      className="w-16 h-8"
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* Typography */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Typography</h2>
              {typography && (
                <div className="space-y-2">
                  <div>
                    <label htmlFor="headings-font" className="block">Headings Font</label>
                    <select
                      id="headings-font"
                      value={typography.headings_font}
                      onChange={(e) => handleTypographyChange('headings_font', e.target.value)}
                      className="w-full p-2 border rounded"
                    >
                      <option value="Arial">Arial</option>
                      <option value="Helvetica">Helvetica</option>
                      <option value="Times New Roman">Times New Roman</option>
                      {/* Add more font options */}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="body-font" className="block">Body Font</label>
                    <select
                      id="body-font"
                      value={typography.body_font}
                      onChange={(e) => handleTypographyChange('body_font', e.target.value)}
                      className="w-full p-2 border rounded"
                    >
                      <option value="Arial">Arial</option>
                      <option value="Helvetica">Helvetica</option>
                      <option value="Times New Roman">Times New Roman</option>
                      {/* Add more font options */}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="base-font-size" className="block">Base Font Size (px)</label>
                    <input
                      type="number"
                      id="base-font-size"
                      value={typography.base_font_size}
                      onChange={(e) => handleTypographyChange('base_font_size', parseInt(e.target.value))}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label htmlFor="line-height" className="block">Line Height</label>
                    <input
                      type="number"
                      id="line-height"
                      value={typography.line_height}
                      onChange={(e) => handleTypographyChange('line_height', parseFloat(e.target.value))}
                      step="0.1"
                      className="w-full p-2 border rounded"
                    />
                  </div>
                </div>
              )}
            </section>

            {/* Layout Options */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Layout Options</h2>
              {layoutOptions && (
                <div className="space-y-2">
                  <div>
                    <label htmlFor="header-style" className="block">Header Style</label>
                    <select
                      id="header-style"
                      value={layoutOptions.header_style}
                      onChange={(e) => handleLayoutChange('header_style', e.target.value)}
                      className="w-full p-2 border rounded"
                    >
                      <option value="fixed">Fixed</option>
                      <option value="sticky">Sticky</option>
                      <option value="static">Static</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="footer-style" className="block">Footer Style</label>
                    <select
                      id="footer-style"
                      value={layoutOptions.footer_style}
                      onChange={(e) => handleLayoutChange('footer_style', e.target.value)}
                      className="w-full p-2 border rounded"
                    >
                      <option value="simple">Simple</option>
                      <option value="complex">Complex</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="sidebar-position" className="block">Sidebar Position</label>
                    <select
                      id="sidebar-position"
                      value={layoutOptions.sidebar_position}
                      onChange={(e) => handleLayoutChange('sidebar_position', e.target.value)}
                      className="w-full p-2 border rounded"
                    >
                      <option value="left">Left</option>
                      <option value="right">Right</option>
                      <option value="none">None</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="content-width" className="block">Content Width</label>
                    <select
                      id="content-width"
                      value={layoutOptions.content_width}
                      onChange={(e) => handleLayoutChange('content_width', e.target.value)}
                      className="w-full p-2 border rounded"
                    >
                      <option value="narrow">Narrow</option>
                      <option value="wide">Wide</option>
                      <option value="full">Full Width</option>
                    </select>
                  </div>
                </div>
              )}
            </section>

            {/* Custom CSS/JS */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Custom Code</h2>
              <div className="space-y-2">
                <div>
                  <label htmlFor="custom-css" className="block">Custom CSS</label>
                  <textarea
                    id="custom-css"
                    value={customCSS}
                    onChange={(e) => setCustomCSS(e.target.value)}
                    className="w-full h-32 p-2 border rounded font-mono"
                  />
                </div>
                <div>
                  <label htmlFor="custom-js" className="block">Custom JavaScript</label>
                  <textarea
                    id="custom-js"
                    value={customJS}
                    onChange={(e) => setCustomJS(e.target.value)}
                    className="w-full h-32 p-2 border rounded font-mono"
                  />
                </div>
                <button
                  onClick={handleCustomCodeSave}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Save Custom Code
                </button>
              </div>
            </section>
          </div>

          {/* Preview Section */}
          <div className="sticky top-0">
            <h2 className="text-2xl font-semibold mb-4">Live Preview</h2>
            <div className="mb-4">
              <label htmlFor="mobile-preview" className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  id="mobile-preview"
                  checked={isMobilePreview}
                  onChange={() => setIsMobilePreview(!isMobilePreview)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">Mobile Preview</span>
              </label>
            </div>
            <div className={`border-4 border-gray-300 rounded-lg overflow-hidden ${isMobilePreview ? 'w-[375px]' : 'w-full'} mx-auto`}>
              <div className="bg-white" style={{ height: '600px', overflow: 'auto' }}>
                <style>{previewStyles}</style>
                <div className="p-4">
                  <h1 className="text-3xl font-bold mb-4">Sample Heading</h1>
                  <p className="mb-4">This is a sample paragraph to demonstrate the typography and color settings. You can see how the changes you make affect the overall look of your website.</p>
                  <button className="px-4 py-2 bg-blue-500 text-white rounded">Sample Button</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UV_DesignCustomization;