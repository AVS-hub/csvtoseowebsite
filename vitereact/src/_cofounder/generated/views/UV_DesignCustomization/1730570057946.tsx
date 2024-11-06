import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { RootState, AppDispatch } from '@/store/main';
import { SketchPicker } from 'react-color';
import debounce from 'lodash/debounce';

const UV_DesignCustomization: React.FC = () => {
  const { project_id } = useParams<{ project_id: string }>();
  const dispatch: AppDispatch = useDispatch();
  const { token } = useSelector((state: RootState) => state.user_auth);
  const currentProject = useSelector((state: RootState) => state.current_project);

  const [selectedTheme, setSelectedTheme] = useState<{ theme_id: string; name: string; thumbnail_url: string } | null>(null);
  const [colorScheme, setColorScheme] = useState<{ primary: string; secondary: string; accent: string; background: string; text: string }>({
    primary: '#007bff',
    secondary: '#6c757d',
    accent: '#28a745',
    background: '#ffffff',
    text: '#333333'
  });
  const [typography, setTypography] = useState<{ headings_font: string; body_font: string; base_font_size: number; line_height: number }>({
    headings_font: 'Arial',
    body_font: 'Helvetica',
    base_font_size: 16,
    line_height: 1.5
  });
  const [layoutOptions, setLayoutOptions] = useState<{ header_style: string; footer_style: string; sidebar_position: string; content_width: string }>({
    header_style: 'default',
    footer_style: 'default',
    sidebar_position: 'left',
    content_width: 'wide'
  });
  const [customCSS, setCustomCSS] = useState('');
  const [customJS, setCustomJS] = useState('');
  const [isMobilePreview, setIsMobilePreview] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDesignSettings = useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost:1337/api/projects/${project_id}/design`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const { theme, colors, typography, layout, custom_css, custom_js } = response.data;
      setSelectedTheme(theme);
      setColorScheme(colors);
      setTypography(typography);
      setLayoutOptions(layout);
      setCustomCSS(custom_css);
      setCustomJS(custom_js);
    } catch (error) {
      setError('Failed to load design settings. Please try again.');
    }
  }, [project_id, token]);

  useEffect(() => {
    fetchDesignSettings();
  }, [fetchDesignSettings]);

  const updateDesignSettings = useCallback(debounce(async (settings: any) => {
    try {
      await axios.put(`http://localhost:1337/api/projects/${project_id}/design`, settings, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      setError('Failed to update design settings. Please try again.');
    }
  }, 500), [project_id, token]);

  const handleThemeChange = (theme: { theme_id: string; name: string; thumbnail_url: string }) => {
    setSelectedTheme(theme);
    updateDesignSettings({ theme });
  };

  const handleColorChange = (color: string, key: keyof typeof colorScheme) => {
    const newColorScheme = { ...colorScheme, [key]: color };
    setColorScheme(newColorScheme);
    updateDesignSettings({ colors: newColorScheme });
  };

  const handleTypographyChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    const newTypography = { ...typography, [name]: value };
    setTypography(newTypography);
    updateDesignSettings({ typography: newTypography });
  };

  const handleLayoutChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newLayoutOptions = { ...layoutOptions, [name]: value };
    setLayoutOptions(newLayoutOptions);
    updateDesignSettings({ layout: newLayoutOptions });
  };

  const handleCustomCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'customCSS') {
      setCustomCSS(value);
      updateDesignSettings({ custom_css: value });
    } else if (name === 'customJS') {
      setCustomJS(value);
      updateDesignSettings({ custom_js: value });
    }
  };

  const toggleMobilePreview = () => {
    setIsMobilePreview(!isMobilePreview);
  };

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Design Customization</h1>
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">{error}</div>}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-8">
            {/* Theme Selection */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Theme Selection</h2>
              <div className="grid grid-cols-3 gap-4">
                {/* Placeholder for theme options */}
                <div className={`border p-2 cursor-pointer ${selectedTheme?.theme_id === 'theme1' ? 'border-blue-500' : ''}`} onClick={() => handleThemeChange({ theme_id: 'theme1', name: 'Modern', thumbnail_url: 'https://picsum.photos/seed/theme1/100/100' })}>
                  <img src="https://picsum.photos/seed/theme1/100/100" alt="Modern Theme" className="w-full h-auto" />
                  <p className="text-center mt-2">Modern</p>
                </div>
                <div className={`border p-2 cursor-pointer ${selectedTheme?.theme_id === 'theme2' ? 'border-blue-500' : ''}`} onClick={() => handleThemeChange({ theme_id: 'theme2', name: 'Classic', thumbnail_url: 'https://picsum.photos/seed/theme2/100/100' })}>
                  <img src="https://picsum.photos/seed/theme2/100/100" alt="Classic Theme" className="w-full h-auto" />
                  <p className="text-center mt-2">Classic</p>
                </div>
                <div className={`border p-2 cursor-pointer ${selectedTheme?.theme_id === 'theme3' ? 'border-blue-500' : ''}`} onClick={() => handleThemeChange({ theme_id: 'theme3', name: 'Minimalist', thumbnail_url: 'https://picsum.photos/seed/theme3/100/100' })}>
                  <img src="https://picsum.photos/seed/theme3/100/100" alt="Minimalist Theme" className="w-full h-auto" />
                  <p className="text-center mt-2">Minimalist</p>
                </div>
              </div>
            </section>

            {/* Color Scheme */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Color Scheme</h2>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(colorScheme).map(([key, color]) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{key.charAt(0).toUpperCase() + key.slice(1)}</label>
                    <SketchPicker
                      color={color}
                      onChange={(color) => handleColorChange(color.hex, key as keyof typeof colorScheme)}
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* Typography */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Typography</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="headings_font" className="block text-sm font-medium text-gray-700 mb-1">Headings Font</label>
                  <select
                    id="headings_font"
                    name="headings_font"
                    value={typography.headings_font}
                    onChange={handleTypographyChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    <option>Arial</option>
                    <option>Helvetica</option>
                    <option>Times New Roman</option>
                    <option>Georgia</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="body_font" className="block text-sm font-medium text-gray-700 mb-1">Body Font</label>
                  <select
                    id="body_font"
                    name="body_font"
                    value={typography.body_font}
                    onChange={handleTypographyChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    <option>Arial</option>
                    <option>Helvetica</option>
                    <option>Times New Roman</option>
                    <option>Georgia</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="base_font_size" className="block text-sm font-medium text-gray-700 mb-1">Base Font Size (px)</label>
                  <input
                    type="number"
                    id="base_font_size"
                    name="base_font_size"
                    value={typography.base_font_size}
                    onChange={handleTypographyChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  />
                </div>
                <div>
                  <label htmlFor="line_height" className="block text-sm font-medium text-gray-700 mb-1">Line Height</label>
                  <input
                    type="number"
                    id="line_height"
                    name="line_height"
                    value={typography.line_height}
                    onChange={handleTypographyChange}
                    step="0.1"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  />
                </div>
              </div>
            </section>

            {/* Layout Options */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Layout Options</h2>
              <div className="space-y-4">
                {Object.entries(layoutOptions).map(([key, value]) => (
                  <div key={key}>
                    <label htmlFor={key} className="block text-sm font-medium text-gray-700 mb-1">{key.replace('_', ' ').charAt(0).toUpperCase() + key.replace('_', ' ').slice(1)}</label>
                    <select
                      id={key}
                      name={key}
                      value={value}
                      onChange={handleLayoutChange}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    >
                      <option value="default">Default</option>
                      <option value="alternative">Alternative</option>
                      <option value="minimal">Minimal</option>
                    </select>
                  </div>
                ))}
              </div>
            </section>

            {/* Custom Code */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Custom Code</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="customCSS" className="block text-sm font-medium text-gray-700 mb-1">Custom CSS</label>
                  <textarea
                    id="customCSS"
                    name="customCSS"
                    value={customCSS}
                    onChange={handleCustomCodeChange}
                    rows={5}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    placeholder="Enter custom CSS here..."
                  ></textarea>
                </div>
                <div>
                  <label htmlFor="customJS" className="block text-sm font-medium text-gray-700 mb-1">Custom JavaScript</label>
                  <textarea
                    id="customJS"
                    name="customJS"
                    value={customJS}
                    onChange={handleCustomCodeChange}
                    rows={5}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    placeholder="Enter custom JavaScript here..."
                  ></textarea>
                </div>
              </div>
            </section>
          </div>

          {/* Preview Section */}
          <div className="sticky top-0">
            <h2 className="text-2xl font-semibold mb-4">Live Preview</h2>
            <div className="border rounded-lg p-4 bg-white shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold" style={{ fontFamily: typography.headings_font, color: colorScheme.text }}>
                  {currentProject?.name || 'Project Name'}
                </h3>
                <button
                  onClick={toggleMobilePreview}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-200"
                >
                  {isMobilePreview ? 'Desktop View' : 'Mobile View'}
                </button>
              </div>
              <div className={`preview-container ${isMobilePreview ? 'w-64 mx-auto' : 'w-full'}`}>
                <div style={{
                  fontFamily: typography.body_font,
                  fontSize: `${typography.base_font_size}px`,
                  lineHeight: typography.line_height,
                  color: colorScheme.text,
                  backgroundColor: colorScheme.background,
                  padding: '1rem',
                  borderRadius: '0.5rem',
                }}>
                  <h1 style={{ fontFamily: typography.headings_font, color: colorScheme.primary }}>Welcome to {currentProject?.name || 'Your Website'}</h1>
                  <p>This is a preview of your website's design. The content and layout will adjust based on your customizations.</p>
                  <button style={{ backgroundColor: colorScheme.accent, color: colorScheme.background, padding: '0.5rem 1rem', borderRadius: '0.25rem', marginTop: '1rem' }}>
                    Call to Action
                  </button>
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