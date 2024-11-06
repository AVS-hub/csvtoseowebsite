import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store/main';
import axios from 'axios';
import { SketchPicker } from 'react-color';
import { debounce } from 'lodash';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { RefreshCw } from "lucide-react";

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
        <h1 className="text-4xl font-bold mb-8">Design Customization</h1>
        {isLoading ? (
          <p className="text-center">Loading design settings...</p>
        ) : error ? (
          <p className="text-red-500 text-center">{error}</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-12">
              {/* Theme Selection */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">Theme Selection</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {/* Placeholder for theme options */}
                  <button
                    className={`p-4 border rounded-lg transition-all ${selectedTheme?.theme_id === 'theme1' ? 'border-blue-500 shadow-lg' : 'border-gray-300 hover:border-blue-300'}`}
                    onClick={() => handleThemeChange({ theme_id: 'theme1', name: 'Default Theme', thumbnail_url: 'https://picsum.photos/seed/theme1/200/200' })}
                  >
                    <img src="https://picsum.photos/seed/theme1/200/200" alt="Default Theme" className="w-full h-auto rounded" />
                    <p className="mt-2 text-center font-medium">Default Theme</p>
                  </button>
                  {/* Add more theme options as needed */}
                </div>
                <Button className="mt-4" variant="outline">
                  Upload Custom Theme
                </Button>
              </section>

              {/* Color Scheme */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">Color Scheme</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(colorScheme).map(([key, value]) => (
                    <div key={key} className="space-y-2">
                      <Label className="capitalize">{key}:</Label>
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded border" style={{ backgroundColor: value }}></div>
                        <SketchPicker
                          color={value}
                          onChange={(color) => handleColorChange(color.hex, key as keyof typeof colorScheme)}
                          className="!absolute z-10"
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex space-x-2">
                  <Button variant="outline">Light Palette</Button>
                  <Button variant="outline">Dark Palette</Button>
                  <Button variant="outline">Custom Palette</Button>
                </div>
              </section>

              {/* Typography */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">Typography</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Headings Font:</Label>
                    <Select
                      value={typography.headings_font}
                      onValueChange={(value) => handleTypographyChange(value, 'headings_font')}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select font" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Arial">Arial</SelectItem>
                        <SelectItem value="Helvetica">Helvetica</SelectItem>
                        <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Body Font:</Label>
                    <Select
                      value={typography.body_font}
                      onValueChange={(value) => handleTypographyChange(value, 'body_font')}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select font" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Arial">Arial</SelectItem>
                        <SelectItem value="Helvetica">Helvetica</SelectItem>
                        <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Base Font Size (px):</Label>
                    <Input
                      type="number"
                      value={typography.base_font_size}
                      onChange={(e) => handleTypographyChange(parseInt(e.target.value), 'base_font_size')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Line Height:</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={typography.line_height}
                      onChange={(e) => handleTypographyChange(parseFloat(e.target.value), 'line_height')}
                    />
                  </div>
                </div>
                <div className="mt-4 flex items-center space-x-2">
                  <Switch id="advanced-typography" />
                  <Label htmlFor="advanced-typography">Advanced Typography</Label>
                </div>
              </section>

              {/* Layout Options */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">Layout Options</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(layoutOptions).map(([key, value]) => (
                    <div key={key} className="space-y-2">
                      <Label className="capitalize">{key.replace('_', ' ')}:</Label>
                      <Select
                        value={value}
                        onValueChange={(newValue) => handleLayoutChange(newValue, key as keyof typeof layoutOptions)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select option" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="default">Default</SelectItem>
                          <SelectItem value="alternate">Alternate</SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
                <div className="mt-4 space-y-4">
                  <div>
                    <Label>Sidebar Position:</Label>
                    <div className="flex space-x-4 mt-2">
                      <Button variant={layoutOptions.sidebar_position === 'left' ? 'default' : 'outline'} onClick={() => handleLayoutChange('left', 'sidebar_position')}>Left</Button>
                      <Button variant={layoutOptions.sidebar_position === 'right' ? 'default' : 'outline'} onClick={() => handleLayoutChange('right', 'sidebar_position')}>Right</Button>
                    </div>
                  </div>
                  <div>
                    <Label>Content Width:</Label>
                    <Slider
                      className="mt-2"
                      value={[parseInt(layoutOptions.content_width)]}
                      min={600}
                      max={1400}
                      step={50}
                      onValueChange={(value) => handleLayoutChange(value[0].toString(), 'content_width')}
                    />
                  </div>
                </div>
              </section>

              {/* Custom CSS/JS */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">Advanced Customization</h2>
                <div className="space-y-4">
                  <div>
                    <Label>Custom CSS:</Label>
                    <Textarea
                      value={customCSS}
                      onChange={(e) => setCustomCSS(e.target.value)}
                      className="font-mono"
                      rows={10}
                    />
                  </div>
                  <div>
                    <Label>Custom JavaScript:</Label>
                    <Textarea
                      value={customJS}
                      onChange={(e) => setCustomJS(e.target.value)}
                      className="font-mono"
                      rows={10}
                    />
                  </div>
                  <Button onClick={handleCustomCodeSave}>
                    Save Custom Code
                  </Button>
                </div>
              </section>
            </div>

            {/* Live Preview */}
            <div className="lg:sticky lg:top-8 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold">Live Preview</h2>
                <Button variant="outline" size="icon">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
              <div className={`border rounded-lg overflow-hidden transition-all ${isMobilePreview ? 'w-64 mx-auto' : 'w-full'}`}>
                <div className="bg-gray-200 p-4 mb-4">Header Preview</div>
                <div className="p-4 space-y-4">
                  <h1 style={{ fontFamily: typography.headings_font, fontSize: `${typography.base_font_size * 1.5}px`, lineHeight: typography.line_height, color: colorScheme.text }}>
                    Sample Heading
                  </h1>
                  <p style={{ fontFamily: typography.body_font, fontSize: `${typography.base_font_size}px`, lineHeight: typography.line_height, color: colorScheme.text }}>
                    This is a sample paragraph to demonstrate the typography and color settings. The content adapts to your chosen styles.
                  </p>
                  <Button style={{ backgroundColor: colorScheme.primary, color: colorScheme.secondary }}>
                    Sample Button
                  </Button>
                </div>
                <div className="bg-gray-200 p-4 mt-4">Footer Preview</div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="mobile-preview"
                  checked={isMobilePreview}
                  onCheckedChange={setIsMobilePreview}
                />
                <Label htmlFor="mobile-preview">Mobile Preview</Label>
              </div>
            </div>
          </div>
        )}
        <div className="mt-8 flex space-x-4">
          <Button>Save Changes</Button>
          <Button variant="outline">Reset to Default</Button>
        </div>
      </div>
    </>
  );
};

export default UV_DesignCustomization;