import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store/main';
import axios from 'axios';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ExternalLink } from 'lucide-react';

const UV_ExportAndPublish: React.FC = () => {
  const { project_id } = useParams<{ project_id: string }>();
  const dispatch: AppDispatch = useDispatch();
  const { token } = useSelector((state: RootState) => state.user_auth);
  const currentProject = useSelector((state: RootState) => state.current_project);

  const [exportOptions, setExportOptions] = useState({
    format: 'html',
    include_assets: true,
    optimize_images: true,
    minify_code: true,
  });

  const [publishingOptions, setPublishingOptions] = useState({
    method: 'ftp',
    destination_url: '',
    credentials: {
      username: '',
      password: '',
    },
  });

  const [exportProgress, setExportProgress] = useState({
    status: 'idle',
    percentage: 0,
    message: '',
  });

  const [publishProgress, setPublishProgress] = useState({
    status: 'idle',
    percentage: 0,
    message: '',
  });

  const [exportHistory, setExportHistory] = useState([]);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    fetchExportHistory();
  }, []);

  const fetchExportHistory = async () => {
    try {
      const response = await axios.get(`http://localhost:1337/api/projects/${project_id}/export/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setExportHistory(response.data);
    } catch (error) {
      setError('Failed to fetch export history');
    }
  };

  const handleExportOptionsChange = (name: string, value: any) => {
    setExportOptions(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePublishingOptionsChange = (name: string, value: any) => {
    setPublishingOptions(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const initializeExport = async () => {
    try {
      const response = await axios.post(`http://localhost:1337/api/projects/${project_id}/export`, exportOptions, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setExportProgress({ status: 'in_progress', percentage: 0, message: 'Export started' });
      checkExportProgress(response.data.export_id);
    } catch (error) {
      setError('Failed to start export process');
    }
  };

  const checkExportProgress = async (export_id: string) => {
    try {
      const response = await axios.get(`http://localhost:1337/api/projects/${project_id}/export/${export_id}/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setExportProgress(response.data);
      if (response.data.status === 'in_progress') {
        setTimeout(() => checkExportProgress(export_id), 5000);
      } else if (response.data.status === 'completed') {
        fetchExportHistory();
        setStatusMessage('Export completed successfully');
      }
    } catch (error) {
      setError('Failed to check export progress');
    }
  };

  const downloadExport = async (export_id: string) => {
    try {
      const response = await axios.get(`http://localhost:1337/api/projects/${project_id}/export/${export_id}/download`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `export_${export_id}.zip`);
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      setError('Failed to download export');
    }
  };

  const initiatePublish = async () => {
    try {
      const response = await axios.post(`http://localhost:1337/api/projects/${project_id}/publish`, publishingOptions, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPublishProgress({ status: 'in_progress', percentage: 0, message: 'Publishing started' });
      checkPublishProgress(response.data.publish_id);
    } catch (error) {
      setError('Failed to start publishing process');
    }
  };

  const checkPublishProgress = async (publish_id: string) => {
    try {
      const response = await axios.get(`http://localhost:1337/api/projects/${project_id}/publish/${publish_id}/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPublishProgress(response.data);
      if (response.data.status === 'in_progress') {
        setTimeout(() => checkPublishProgress(publish_id), 5000);
      } else if (response.data.status === 'completed') {
        setStatusMessage('Website published successfully');
      }
    } catch (error) {
      setError('Failed to check publishing progress');
    }
  };

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Export and Publish</h1>
        <p className="mb-8 text-gray-600">Export your project or publish it directly to your chosen platform.</p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
            <p>{error}</p>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/2">
            <h2 className="text-xl font-semibold mb-4">Export Options</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="format">
                  Export Format
                </label>
                <Select
                  value={exportOptions.format}
                  onValueChange={(value) => handleExportOptionsChange('format', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="html">Static HTML</SelectItem>
                    <SelectItem value="wordpress">WordPress Theme</SelectItem>
                    <SelectItem value="custom">Custom CMS Format</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="include_assets"
                  checked={exportOptions.include_assets}
                  onCheckedChange={(checked) => handleExportOptionsChange('include_assets', checked)}
                />
                <label htmlFor="include_assets" className="text-sm font-medium">
                  Include Assets
                </label>
              </div>
              <div className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="optimize_images"
                    checked={exportOptions.optimize_images}
                    onCheckedChange={(checked) => handleExportOptionsChange('optimize_images', checked)}
                  />
                  <label htmlFor="optimize_images" className="text-sm font-medium">
                    Optimize Images
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="minify_code"
                    checked={exportOptions.minify_code}
                    onCheckedChange={(checked) => handleExportOptionsChange('minify_code', checked)}
                  />
                  <label htmlFor="minify_code" className="text-sm font-medium">
                    Minify Code
                  </label>
                </div>
              </div>
              <Button onClick={initializeExport} disabled={exportProgress.status === 'in_progress'}>
                Start Export
              </Button>
            </div>

            {exportProgress.status !== 'idle' && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2">Export Progress</h3>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${exportProgress.percentage}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600">{exportProgress.message}</p>
              </div>
            )}

            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Export History</h3>
              <Table>
                <TableCaption>A list of your recent exports.</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Format</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {exportHistory.map((export_item: any) => (
                    <TableRow key={export_item.id}>
                      <TableCell>{new Date(export_item.timestamp).toLocaleString()}</TableCell>
                      <TableCell>{export_item.format}</TableCell>
                      <TableCell>{export_item.status}</TableCell>
                      <TableCell>
                        {export_item.status === 'completed' && (
                          <Button variant="outline" size="sm" onClick={() => downloadExport(export_item.id)}>
                            Download
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="w-full md:w-1/2">
            <h2 className="text-xl font-semibold mb-4">Publishing Options</h2>
            <div className="space-y-4">
              <RadioGroup
                value={publishingOptions.method}
                onValueChange={(value) => handlePublishingOptionsChange('method', value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="ftp" id="ftp" />
                  <label htmlFor="ftp">FTP</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="hosting_integration" id="hosting_integration" />
                  <label htmlFor="hosting_integration">Hosting Integration</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="github_pages" id="github_pages" />
                  <label htmlFor="github_pages">GitHub Pages</label>
                </div>
              </RadioGroup>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="destination_url">
                  Destination URL
                </label>
                <Input
                  id="destination_url"
                  value={publishingOptions.destination_url}
                  onChange={(e) => handlePublishingOptionsChange('destination_url', e.target.value)}
                  placeholder="Enter destination URL"
                />
              </div>
              {publishingOptions.method === 'ftp' && (
                <div className="flex space-x-4">
                  <div className="w-1/2">
                    <label className="block text-sm font-medium mb-1" htmlFor="username">
                      Username
                    </label>
                    <Input
                      id="username"
                      value={publishingOptions.credentials.username}
                      onChange={(e) => handlePublishingOptionsChange('credentials', { ...publishingOptions.credentials, username: e.target.value })}
                      placeholder="Enter username"
                    />
                  </div>
                  <div className="w-1/2">
                    <label className="block text-sm font-medium mb-1" htmlFor="password">
                      Password
                    </label>
                    <Input
                      id="password"
                      type="password"
                      value={publishingOptions.credentials.password}
                      onChange={(e) => handlePublishingOptionsChange('credentials', { ...publishingOptions.credentials, password: e.target.value })}
                      placeholder="Enter password"
                    />
                  </div>
                </div>
              )}
              <Button onClick={initiatePublish} disabled={publishProgress.status === 'in_progress'}>
                Publish Website
              </Button>
            </div>

            {publishProgress.status !== 'idle' && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2">Publishing Progress</h3>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                  <div
                    className="bg-green-600 h-2.5 rounded-full"
                    style={{ width: `${publishProgress.percentage}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600">{publishProgress.message}</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8">
          <p className="text-sm text-gray-600 mb-4">{statusMessage}</p>
          <div className="flex justify-between">
            <Link to="/editor">
              <Button variant="outline">Back to Editor</Button>
            </Link>
            {publishProgress.status === 'completed' && (
              <Button variant="outline">
                View Published Website
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default UV_ExportAndPublish;