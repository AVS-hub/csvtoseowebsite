import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store/main';
import axios from 'axios';
import { SketchPicker } from 'react-color';
import { debounce } from 'lodash';

const UV_DesignCustomization: React.FC = () => {
  const { project_id } = useParams<{ project_id: string }>();
  const dispatch: AppDispatch = useDispatch();
  const userAuth = useSelector((state: RootState) => state.user_auth);
  const currentProject = useSelector((state: RootState) => state.current_project);

  const [selectedTheme, setSelectedTheme] = useState<{ theme_id: string; name: string; thumbnail_url: string } | null>(null);
  const [colorScheme, setColorScheme] = useState<{ primary: string; secondary: string; accent: string; background: string; text: string }>({
    primary: '#000000',
    secondary: '#ffffff',
    accent: '#0000ff',
    background: '#f0f0f0',
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const api = axios.create({
    baseURL: 'http://localhost:1337/api',
    headers: { Authorization: `Bearer ${userAuth.token}` }
  });

  useEffect(() => {
    loadDesignSettings();
  }, [project_id]);

  const loadDesignSettings = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/projects/${project_id}/design`);
      const { theme, color_scheme, typography: typo, layout_options, custom_css, custom_js } = response.data;
      setSelectedTheme(theme);
      setColorScheme(color_scheme);
      setTypography(typo);
      setLayoutOptions(layout_options);
      setCustomCSS(custom_css);
      setCustomJS(custom_js);
      setIsLoading(false);
    } catch (err) {
      setError('Failed to load design settings. Please try again.');
      setIsLoading(false);
    }
  };

  const updateDesignSetting = async (endpoint: string, data: any) => {
    try {
      await api.put(`/projects/${project_id}/design/${endpoint}`, data);
    } catch (err) {
      setError(`Failed to update ${endpoint}. Please try again.`);
    }
  };

  const debouncedUpdateDesign = debounce(updateDesignSetting, 500);

  const handleThemeChange = (theme: { theme_id: string; name: string; thumbnail_url: string }) => {
    setSelectedTheme(theme);
    updateDesignSetting('theme', { theme_id: theme.theme_id });
  };

  const handleColorChange = (color: string, type: keyof typeof colorScheme) => {
    setColorScheme(prev => ({ ...prev, [type]: color }));
    debouncedUpdateDesign('colors', { ...colorScheme, [type]: color });
  };

  const handleTypographyChange = (value: string | number, type: keyof typeof typography) => {
    setTypography(prev => ({ ...prev, [type]: value }));
    debouncedUpdateDesign('typography', { ...typography, [type]: value });
  };

  const handleLayoutChange = (value: string, type: keyof typeof layoutOptions) => {
    setLayoutOptions(prev => ({ ...prev, [type]: value }));
    debouncedUpdateDesign('layout', { ...layoutOptions, [type]: value });
  };

  const handleCustomCodeSave = () => {
    updateDesignSetting('custom-code', { custom_css: customCSS, custom_js: customJS });
  };

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Design Customization</h1>
        {isLoading ? (
          <p>Loading design settings...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-8">
              {/* Theme Selection */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">Theme Selection</h2>
                <div className="grid grid-cols-3 gap-4">
                  {/* Placeholder for theme options */}
                  <button
                    className={`p-4 border rounded ${selectedTheme?.theme_id === 'theme1' ? 'border-blue-500' : 'border-gray-300'}`}
                    onClick={() => handleThemeChange({ theme_id: 'theme1', name: 'Default Theme', thumbnail_url: 'https://picsum.photos/seed/theme1/100/100' })}
                  >
                    <img src="https://picsum.photos/seed/theme1/100/100" alt="Default Theme" className="w-full h-auto" />
                    <p className="mt-2 text-center">Default Theme</p>
                  </button>
                  {/* Add more theme options as needed */}
                </div>
              </section>

              {/* Color Scheme */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">Color Scheme</h2>
                <div className="space-y-4">
                  {Object.entries(colorScheme).map(([key, value]) => (
                    <div key={key} className="flex items-center">
                      <label className="w-1/3 capitalize">{key}:</label>
                      <SketchPicker
                        color={value}
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
                    <label className="block mb-2">Headings Font:</label>
                    <select
                      value={typography.headings_font}
                      onChange={(e) => handleTypographyChange(e.target.value, 'headings_font')}
                      className="w-full p-2 border rounded"
                    >
                      <option value="Arial">Arial</option>
                      <option value="Helvetica">Helvetica</option>
                      <option value="Times New Roman">Times New Roman</option>
                    </select>
                  </div>
                  <div>
                    <label className="block mb-2">Body Font:</label>
                    <select
                      value={typography.body_font}
                      onChange={(e) => handleTypographyChange(e.target.value, 'body_font')}
                      className="w-full p-2 border rounded"
                    >
                      <option value="Arial">Arial</option>
                      <option value="Helvetica">Helvetica</option>
                      <option value="Times New Roman">Times New Roman</option>
                    </select>
                  </div>
                  <div>
                    <label className="block mb-2">Base Font Size (px):</label>
                    <input
                      type="number"
                      value={typography.base_font_size}
                      onChange={(e) => handleTypographyChange(parseInt(e.target.value), 'base_font_size')}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block mb-2">Line Height:</label>
                    <input
                      type="number"
                      step="0.1"
                      value={typography.line_height}
                      onChange={(e) => handleTypographyChange(parseFloat(e.target.value), 'line_height')}
                      className="w-full p-2 border rounded"
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
                      <label className="block mb-2 capitalize">{key.replace('_', ' ')}:</label>
                      <select
                        value={value}
                        onChange={(e) => handleLayoutChange(e.target.value, key as keyof typeof layoutOptions)}
                        className="w-full p-2 border rounded"
                      >
                        <option value="default">Default</option>
                        <option value="alternate">Alternate</option>
                        <option value="custom">Custom</option>
                      </select>
                    </div>
                  ))}
                </div>
              </section>

              {/* Custom CSS/JS */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">Custom Code</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block mb-2">Custom CSS:</label>
                    <textarea
                      value={customCSS}
                      onChange={(e) => setCustomCSS(e.target.value)}
                      className="w-full p-2 border rounded h-40"
                    ></textarea>
                  </div>
                  <div>
                    <label className="block mb-2">Custom JavaScript:</label>
                    <textarea
                      value={customJS}
                      onChange={(e) => setCustomJS(e.target.value)}
                      className="w-full p-2 border rounded h-40"
                    ></textarea>
                  </div>
                  <button
                    onClick={handleCustomCodeSave}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Save Custom Code
                  </button>
                </div>
              </section>
            </div>

            {/* Live Preview */}
            <div className="sticky top-0">
              <h2 className="text-2xl font-semibold mb-4">Live Preview</h2>
              <div className={`border rounded p-4 ${isMobilePreview ? 'w-64 mx-auto' : 'w-full'}`}>
                <div className="bg-gray-200 p-4 mb-4">Header Preview</div>
                <div className="space-y-4">
                  <h1 style={{ fontFamily: typography.headings_font, fontSize: `${typography.base_font_size * 1.5}px`, lineHeight: typography.line_height, color: colorScheme.text }}>
                    Sample Heading
                  </h1>
                  <p style={{ fontFamily: typography.body_font, fontSize: `${typography.base_font_size}px`, lineHeight: typography.line_height, color: colorScheme.text }}>
                    This is a sample paragraph to demonstrate the typography and color settings. The content adapts to your chosen styles.
                  </p>
                  <button style={{ backgroundColor: colorScheme.primary, color: colorScheme.secondary }} className="px-4 py-2 rounded">
                    Sample Button
                  </button>
                </div>
                <div className="bg-gray-200 p-4 mt-4">Footer Preview</div>
              </div>
              <div className="mt-4">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={isMobilePreview}
                    onChange={() => setIsMobilePreview(!isMobilePreview)}
                    className="form-checkbox h-5 w-5 text-blue-600"
                  />
                  <span className="ml-2 text-gray-700">Mobile Preview</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default UV_DesignCustomization;