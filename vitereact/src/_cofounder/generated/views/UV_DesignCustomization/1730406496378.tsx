import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store/main';
import axios from 'axios';
import { debounce } from 'lodash';
import { SketchPicker } from 'react-color';

const UV_DesignCustomization: React.FC = () => {
  const { project_id } = useParams<{ project_id: string }>();
  const dispatch: AppDispatch = useDispatch();
  const { token } = useSelector((state: RootState) => state.user_auth);
  const currentProject = useSelector((state: RootState) => state.current_project);

  const [selectedTheme, setSelectedTheme] = useState<{ theme_id: string; name: string; thumbnail_url: string } | null>(null);
  const [colorScheme, setColorScheme] = useState<{ primary: string; secondary: string; accent: string; background: string; text: string } | null>(null);
  const [typography, setTypography] = useState<{ headings_font: string; body_font: string; base_font_size: number; line_height: number } | null>(null);
  const [layoutOptions, setLayoutOptions] = useState<{ header_style: string; footer_style: string; sidebar_position: string; content_width: string } | null>(null);
  const [customCSS, setCustomCSS] = useState<string>('');
  const [customJS, setCustomJS] = useState<string>('');
  const [isMobilePreview, setIsMobilePreview] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const api = axios.create({
    baseURL: 'http://localhost:1337/api',
    headers: { Authorization: `Bearer ${token}` }
  });

  const loadDesignSettings = useCallback(async () => {
    try {
      setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  }, [project_id, api]);

  useEffect(() => {
    loadDesignSettings();
  }, [loadDesignSettings]);

  const updateDesign = useCallback(debounce(async (endpoint: string, data: any) => {
    try {
      await api.put(`/projects/${project_id}/design/${endpoint}`, data);
    } catch (err) {
      setError(`Failed to update ${endpoint}. Please try again.`);
    }
  }, 500), [project_id, api]);

  const handleThemeChange = (themeId: string) => {
    setSelectedTheme(prevTheme => ({ ...prevTheme!, theme_id: themeId }));
    updateDesign('theme', { theme_id: themeId });
  };

  const handleColorChange = (color: string, type: keyof typeof colorScheme) => {
    setColorScheme(prevColors => ({ ...prevColors!, [type]: color }));
    updateDesign('colors', { [type]: color });
  };

  const handleTypographyChange = (value: string | number, type: keyof typeof typography) => {
    setTypography(prevTypography => ({ ...prevTypography!, [type]: value }));
    updateDesign('typography', { [type]: value });
  };

  const handleLayoutChange = (value: string, type: keyof typeof layoutOptions) => {
    setLayoutOptions(prevLayout => ({ ...prevLayout!, [type]: value }));
    updateDesign('layout', { [type]: value });
  };

  const handleCustomCodeSave = () => {
    updateDesign('custom-code', { css: customCSS, js: customJS });
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Design Customization</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-8">
            {/* Theme Selection */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Theme Selection</h2>
              <div className="grid grid-cols-3 gap-4">
                {['theme1', 'theme2', 'theme3'].map((themeId) => (
                  <button
                    key={themeId}
                    className={`p-4 border rounded-lg ${selectedTheme?.theme_id === themeId ? 'border-blue-500' : 'border-gray-300'}`}
                    onClick={() => handleThemeChange(themeId)}
                  >
                    {themeId}
                  </button>
                ))}
              </div>
            </section>

            {/* Color Scheme */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Color Scheme</h2>
              {colorScheme && Object.entries(colorScheme).map(([key, value]) => (
                <div key={key} className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">{key}</label>
                  <SketchPicker
                    color={value}
                    onChange={(color) => handleColorChange(color.hex, key as keyof typeof colorScheme)}
                  />
                </div>
              ))}
            </section>

            {/* Typography */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Typography</h2>
              {typography && Object.entries(typography).map(([key, value]) => (
                <div key={key} className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">{key}</label>
                  {typeof value === 'string' ? (
                    <select
                      value={value}
                      onChange={(e) => handleTypographyChange(e.target.value, key as keyof typeof typography)}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    >
                      <option value="Arial">Arial</option>
                      <option value="Helvetica">Helvetica</option>
                      <option value="Times New Roman">Times New Roman</option>
                    </select>
                  ) : (
                    <input
                      type="number"
                      value={value}
                      onChange={(e) => handleTypographyChange(parseFloat(e.target.value), key as keyof typeof typography)}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    />
                  )}
                </div>
              ))}
            </section>

            {/* Layout Options */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Layout Options</h2>
              {layoutOptions && Object.entries(layoutOptions).map(([key, value]) => (
                <div key={key} className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">{key}</label>
                  <select
                    value={value}
                    onChange={(e) => handleLayoutChange(e.target.value, key as keyof typeof layoutOptions)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    <option value="option1">Option 1</option>
                    <option value="option2">Option 2</option>
                    <option value="option3">Option 3</option>
                  </select>
                </div>
              ))}
            </section>

            {/* Custom CSS/JS */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Custom CSS/JS</h2>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Custom CSS</label>
                <textarea
                  value={customCSS}
                  onChange={(e) => setCustomCSS(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  rows={5}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Custom JavaScript</label>
                <textarea
                  value={customJS}
                  onChange={(e) => setCustomJS(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  rows={5}
                />
              </div>
              <button
                onClick={handleCustomCodeSave}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Save Custom Code
              </button>
            </section>
          </div>

          {/* Preview Section */}
          <div className="sticky top-0">
            <h2 className="text-2xl font-semibold mb-4">Live Preview</h2>
            <div className="border border-gray-300 rounded-lg p-4 h-[600px] overflow-auto">
              <div className={`${isMobilePreview ? 'w-[375px] mx-auto' : 'w-full'}`}>
                {/* Implement preview content here */}
                <div style={{ color: colorScheme?.text, backgroundColor: colorScheme?.background }}>
                  <h1 style={{ fontFamily: typography?.headings_font, fontSize: `${typography?.base_font_size}px` }}>
                    Preview Title
                  </h1>
                  <p style={{ fontFamily: typography?.body_font, lineHeight: typography?.line_height }}>
                    This is a preview of your website design. The content here will update in real-time as you make changes to the design settings.
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsMobilePreview(!isMobilePreview)}
              className="mt-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded"
            >
              {isMobilePreview ? 'Desktop Preview' : 'Mobile Preview'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default UV_DesignCustomization;