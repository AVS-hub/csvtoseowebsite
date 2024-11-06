import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { RootState, AppDispatch } from '@/store/main';
import { debounce } from 'lodash';
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Toggle } from "@/components/ui/toggle";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Save, Undo2, RefreshCw, HelpCircle } from 'lucide-react';

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
      <div className="flex flex-col h-screen">
        {/* Top Bar */}
        <div className="bg-white shadow-md p-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Design Customization</h1>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
            <Button variant="ghost" size="sm">
              <Undo2 className="w-4 h-4 mr-2" />
              Discard Changes
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar */}
          <div className="w-80 bg-gray-100 p-6 overflow-y-auto">
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">{error}</div>}

            {/* Theme Selection */}
            <section className="mb-8">
              <h2 className="text-lg font-semibold mb-4">Theme Selection</h2>
              <Carousel>
                <CarouselContent>
                  {/* This is a placeholder. In a real scenario, you'd map over available themes */}
                  <CarouselItem className="basis-1/3">
                    <button
                      className={`p-2 border rounded ${selectedTheme?.theme_id === 'theme1' ? 'border-blue-500' : 'border-gray-300'}`}
                      onClick={() => handleThemeChange({ theme_id: 'theme1', name: 'Modern', thumbnail_url: 'https://picsum.photos/seed/theme1/100/100' })}
                    >
                      <img src="https://picsum.photos/seed/theme1/100/100" alt="Modern Theme" className="w-full h-auto" />
                      <span>Modern</span>
                    </button>
                  </CarouselItem>
                  {/* Add more theme options here */}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            </section>

            {/* Color Scheme */}
            <section className="mb-8">
              <h2 className="text-lg font-semibold mb-4">Color Scheme</h2>
              {colorScheme && Object.entries(colorScheme).map(([key, value]) => (
                <div key={key} className="flex items-center mb-2">
                  <label htmlFor={`color-${key}`} className="w-1/3 capitalize">{key}</label>
                  <Input
                    type="color"
                    id={`color-${key}`}
                    value={value}
                    onChange={(e) => handleColorChange(key as keyof typeof colorScheme, e.target.value)}
                    className="w-16 h-8"
                  />
                </div>
              ))}
              <Carousel className="mt-4">
                <CarouselContent>
                  {/* Placeholder for color palettes */}
                  <CarouselItem className="basis-1/3">
                    <div className="h-8 bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500" />
                  </CarouselItem>
                  {/* Add more color palette options */}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            </section>

            {/* Typography */}
            <section className="mb-8">
              <h2 className="text-lg font-semibold mb-4">Typography</h2>
              {typography && (
                <>
                  <div className="mb-4">
                    <Label htmlFor="headings-font">Headings Font</Label>
                    <Select
                      value={typography.headings_font}
                      onValueChange={(value) => handleTypographyChange('headings_font', value)}
                    >
                      <SelectTrigger id="headings-font">
                        <SelectValue placeholder="Select heading font" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Arial">Arial</SelectItem>
                        <SelectItem value="Helvetica">Helvetica</SelectItem>
                        <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="mb-4">
                    <Label htmlFor="body-font">Body Font</Label>
                    <Select
                      value={typography.body_font}
                      onValueChange={(value) => handleTypographyChange('body_font', value)}
                    >
                      <SelectTrigger id="body-font">
                        <SelectValue placeholder="Select body font" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Arial">Arial</SelectItem>
                        <SelectItem value="Helvetica">Helvetica</SelectItem>
                        <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="mb-4">
                    <Label htmlFor="base-font-size">Base Font Size (px)</Label>
                    <Input
                      type="number"
                      id="base-font-size"
                      value={typography.base_font_size}
                      onChange={(e) => handleTypographyChange('base_font_size', parseInt(e.target.value))}
                    />
                  </div>
                  <div className="mb-4">
                    <Label htmlFor="line-height">Line Height</Label>
                    <Slider
                      id="line-height"
                      min={1}
                      max={2}
                      step={0.1}
                      value={[typography.line_height]}
                      onValueChange={(value) => handleTypographyChange('line_height', value[0])}
                    />
                  </div>
                </>
              )}
            </section>

            {/* Layout Options */}
            <section className="mb-8">
              <h2 className="text-lg font-semibold mb-4">Layout Options</h2>
              {layoutOptions && (
                <>
                  <div className="mb-4">
                    <Label htmlFor="header-style">Header Style</Label>
                    <Select
                      value={layoutOptions.header_style}
                      onValueChange={(value) => handleLayoutChange('header_style', value)}
                    >
                      <SelectTrigger id="header-style">
                        <SelectValue placeholder="Select header style" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fixed">Fixed</SelectItem>
                        <SelectItem value="sticky">Sticky</SelectItem>
                        <SelectItem value="static">Static</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="mb-4">
                    <Label htmlFor="footer-style">Footer Style</Label>
                    <Select
                      value={layoutOptions.footer_style}
                      onValueChange={(value) => handleLayoutChange('footer_style', value)}
                    >
                      <SelectTrigger id="footer-style">
                        <SelectValue placeholder="Select footer style" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="simple">Simple</SelectItem>
                        <SelectItem value="complex">Complex</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="mb-4">
                    <Label>Sidebar Position</Label>
                    <RadioGroup
                      value={layoutOptions.sidebar_position}
                      onValueChange={(value) => handleLayoutChange('sidebar_position', value)}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="left" id="sidebar-left" />
                        <Label htmlFor="sidebar-left">Left</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="right" id="sidebar-right" />
                        <Label htmlFor="sidebar-right">Right</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="none" id="sidebar-none" />
                        <Label htmlFor="sidebar-none">None</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <div className="mb-4">
                    <Label htmlFor="content-width">Content Width</Label>
                    <Slider
                      id="content-width"
                      min={0}
                      max={100}
                      step={1}
                      value={[parseInt(layoutOptions.content_width)]}
                      onValueChange={(value) => handleLayoutChange('content_width', value[0].toString())}
                    />
                  </div>
                </>
              )}
            </section>

            {/* Custom CSS/JS */}
            <section>
              <h2 className="text-lg font-semibold mb-4">Custom Code</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="custom-css">Custom CSS</Label>
                  <Textarea
                    id="custom-css"
                    value={customCSS}
                    onChange={(e) => setCustomCSS(e.target.value)}
                    className="font-mono"
                    rows={5}
                  />
                </div>
                <div>
                  <Label htmlFor="custom-js">Custom JavaScript</Label>
                  <Textarea
                    id="custom-js"
                    value={customJS}
                    onChange={(e) => setCustomJS(e.target.value)}
                    className="font-mono"
                    rows={5}
                  />
                </div>
                <Button onClick={handleCustomCodeSave}>
                  Save Custom Code
                </Button>
              </div>
            </section>
          </div>

          {/* Preview Section */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="mb-4 flex justify-between items-center">
              <Toggle
                pressed={isMobilePreview}
                onPressedChange={setIsMobilePreview}
              >
                Mobile Preview
              </Toggle>
              <Button variant="ghost" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Preview
              </Button>
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

      {/* Floating Help Button */}
      <Button
        className="fixed bottom-4 right-4 rounded-full"
        size="icon"
        variant="secondary"
      >
        <HelpCircle className="h-6 w-6" />
      </Button>
    </>
  );
};

export default UV_DesignCustomization;