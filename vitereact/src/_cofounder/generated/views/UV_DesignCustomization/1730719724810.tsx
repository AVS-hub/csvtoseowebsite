import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { RootState, AppDispatch } from '@/store/main';
import { debounce } from 'lodash';

const UV_DesignCustomization: React.FC = () => {
  const { project_id } = useParams<{ project_id: string }>();
  const dispatch: AppDispatch = useDispatch();
  const userAuth = useSelector((state: RootState) => state.user_auth);
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
  }>({
    primary: '#000000',
    secondary: '#ffffff',
    accent: '#ff0000',
    background: '#f0f0f0',
    text: '#333333',
  });

  const [typography, setTypography] = useState<{
    headings_font: string;
    body_font: string;
    base_font_size: number;
    line_height: number;
  }>({
    headings_font: 'Arial',
    body_font: 'Helvetica',
    base_font_size: 16,
    line_height: 1.5,
  });

  const [layoutOptions, setLayoutOptions] = useState<{
    header_style: string;
    footer_style: string;
    sidebar_position: string;
    content_width: string;
  }>({
    header_style: 'default',
    footer_style: 'default',
    sidebar_position: 'left',
    content_width: 'wide',
  });

  const [customCSS, setCustomCSS] = useState('');
  const [customJS, setCustomJS] = useState('');
  const [isMobilePreview, setIsMobilePreview] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDesignSettings = useCallback(async () => {
    if (!project_id) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get(`/api/projects/${project_id}/design`);
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
  }, [project_id]);

  useEffect(() => {
    loadDesignSettings();
  }, [loadDesignSettings]);

  const saveDesignSettings = useCallback(
    debounce(async () => {
      if (!project_id) return;

      try {
        await axios.put(`/api/projects/${project_id}/design`, {
          theme: selectedTheme,
          colors: colorScheme,
          typography,
          layout: layoutOptions,
          custom_code: {
            css: customCSS,
            js: customJS,
          },
        });
      } catch (err) {
        setError('Failed to save design settings. Please try again.');
      }
    }, 500),
    [project_id, selectedTheme, colorScheme, typography, layoutOptions, customCSS, customJS]
  );

  useEffect(() => {
    saveDesignSettings();
  }, [selectedTheme, colorScheme, typography, layoutOptions, customCSS, customJS, saveDesignSettings]);

  const handleThemeChange = (theme: typeof selectedTheme) => {
    setSelectedTheme(theme);
  };

  const handleColorChange = (key: keyof typeof colorScheme, value: string) => {
    setColorScheme((prev) => ({ ...prev, [key]: value }));
  };

  const handleTypographyChange = (key: keyof typeof typography, value: string | number) => {
    setTypography((prev) => ({ ...prev, [key]: value }));
  };

  const handleLayoutChange = (key: keyof typeof layoutOptions, value: string) => {
    setLayoutOptions((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Design Customization</h1>
      {isLoading ? (
        <div className="text-center">Loading design settings...</div>
      ) : error ? (
        <div className="text-red-500 text-center">{error}</div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-1/2">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Theme Selection</h2>
              {/* Implement theme selection UI here */}
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Color Scheme</h2>
              {Object.entries(colorScheme).map(([key, value]) => (
                <div key={key} className="flex items-center mb-2">
                  <label htmlFor={key} className="w-1/3 capitalize">
                    {key}:
                  </label>
                  <input
                    type="color"
                    id={key}
                    value={value}
                    onChange={(e) => handleColorChange(key as keyof typeof colorScheme, e.target.value)}
                    className="w-16 h-8 border border-gray-300 rounded"
                  />
                </div>
              ))}
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Typography</h2>
              {Object.entries(typography).map(([key, value]) => (
                <div key={key} className="flex items-center mb-2">
                  <label htmlFor={key} className="w-1/3 capitalize">
                    {key.replace('_', ' ')}:
                  </label>
                  {typeof value === 'number' ? (
                    <input
                      type="number"
                      id={key}
                      value={value}
                      onChange={(e) => handleTypographyChange(key as keyof typeof typography, parseFloat(e.target.value))}
                      className="w-16 border border-gray-300 rounded px-2 py-1"
                    />
                  ) : (
                    <input
                      type="text"
                      id={key}
                      value={value}
                      onChange={(e) => handleTypographyChange(key as keyof typeof typography, e.target.value)}
                      className="w-48 border border-gray-300 rounded px-2 py-1"
                    />
                  )}
                </div>
              ))}
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Layout Options</h2>
              {Object.entries(layoutOptions).map(([key, value]) => (
                <div key={key} className="flex items-center mb-2">
                  <label htmlFor={key} className="w-1/3 capitalize">
                    {key.replace('_', ' ')}:
                  </label>
                  <select
                    id={key}
                    value={value}
                    onChange={(e) => handleLayoutChange(key as keyof typeof layoutOptions, e.target.value)}
                    className="w-48 border border-gray-300 rounded px-2 py-1"
                  >
                    <option value="default">Default</option>
                    <option value="alternate">Alternate</option>
                    {/* Add more options as needed */}
                  </select>
                </div>
              ))}
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Custom Code</h2>
              <div className="mb-4">
                <label htmlFor="customCSS" className="block mb-2">
                  Custom CSS:
                </label>
                <textarea
                  id="customCSS"
                  value={customCSS}
                  onChange={(e) => setCustomCSS(e.target.value)}
                  className="w-full h-32 border border-gray-300 rounded px-2 py-1"
                />
              </div>
              <div>
                <label htmlFor="customJS" className="block mb-2">
                  Custom JavaScript:
                </label>
                <textarea
                  id="customJS"
                  value={customJS}
                  onChange={(e) => setCustomJS(e.target.value)}
                  className="w-full h-32 border border-gray-300 rounded px-2 py-1"
                />
              </div>
            </section>
          </div>

          <div className="w-full lg:w-1/2">
            <div className="sticky top-8">
              <h2 className="text-2xl font-semibold mb-4">Live Preview</h2>
              <div className="mb-4">
                <label htmlFor="previewToggle" className="mr-2">
                  Mobile Preview:
                </label>
                <input
                  type="checkbox"
                  id="previewToggle"
                  checked={isMobilePreview}
                  onChange={() => setIsMobilePreview(!isMobilePreview)}
                />
              </div>
              <div
                className={`border border-gray-300 rounded ${
                  isMobilePreview ? 'w-64 mx-auto' : 'w-full'
                } h-96 overflow-hidden`}
              >
                {/* Implement live preview here */}
                <div style={{ backgroundColor: colorScheme.background, color: colorScheme.text, padding: '1rem' }}>
                  <h1 style={{ fontFamily: typography.headings_font, fontSize: `${typography.base_font_size * 1.5}px` }}>
                    Preview Heading
                  </h1>
                  <p style={{ fontFamily: typography.body_font, fontSize: `${typography.base_font_size}px`, lineHeight: typography.line_height }}>
                    This is a preview of your website's design. As you make changes, you'll see them reflected here in real-time.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UV_DesignCustomization;