import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { RootState, AppDispatch } from '@/store/main';
import { debounce } from 'lodash';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";

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

  const api = axios.create({
    baseURL: 'http://localhost:1337/api',
    headers: { Authorization: `Bearer ${token}` },
  });

  const fetchExportHistory = useCallback(async () => {
    try {
      const response = await api.get(`/projects/${project_id}/export/history`);
      setExportHistory(response.data);
    } catch (error) {
      setError('Failed to fetch export history');
    }
  }, [project_id, api]);

  useEffect(() => {
    fetchExportHistory();
  }, [fetchExportHistory]);

  const handleExportOptionChange = (name: string, value: string | boolean) => {
    setExportOptions(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePublishingOptionChange = (name: string, value: string) => {
    if (name.startsWith('credentials.')) {
      const credentialField = name.split('.')[1];
      setPublishingOptions(prev => ({
        ...prev,
        credentials: {
          ...prev.credentials,
          [credentialField]: value,
        },
      }));
    } else {
      setPublishingOptions(prev => ({ ...prev, [name]: value }));
    }
  };

  const initializeExport = async () => {
    try {
      const response = await api.post(`/projects/${project_id}/export`, exportOptions);
      setExportProgress({ status: 'in_progress', percentage: 0, message: 'Export started' });
      checkExportProgress(response.data.export_id);
    } catch (error) {
      setError('Failed to start export process');
    }
  };

  const checkExportProgress = useCallback(debounce(async (exportId: string) => {
    try {
      const response = await api.get(`/projects/${project_id}/export/${exportId}/status`);
      setExportProgress(response.data);
      if (response.data.status === 'in_progress') {
        checkExportProgress(exportId);
      } else if (response.data.status === 'completed') {
        fetchExportHistory();
      }
    } catch (error) {
      setError('Failed to check export progress');
    }
  }, 5000), [project_id, api, fetchExportHistory]);

  const downloadExport = async (exportId: string) => {
    try {
      const response = await api.get(`/projects/${project_id}/export/${exportId}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `export_${exportId}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      setError('Failed to download export');
    }
  };

  const initiatePublish = async () => {
    try {
      const response = await api.post(`/projects/${project_id}/publish`, publishingOptions);
      setPublishProgress({ status: 'in_progress', percentage: 0, message: 'Publishing started' });
      checkPublishProgress(response.data.publish_id);
    } catch (error) {
      setError('Failed to start publishing process');
    }
  };

  const checkPublishProgress = useCallback(debounce(async (publishId: string) => {
    try {
      const response = await api.get(`/projects/${project_id}/publish/${publishId}/status`);
      setPublishProgress(response.data);
      if (response.data.status === 'in_progress') {
        checkPublishProgress(publishId);
      }
    } catch (error) {
      setError('Failed to check publishing progress');
    }
  }, 5000), [project_id, api]);

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-4">Export and Publish</h1>
        <p className="text-lg text-gray-600 mb-8">Manage your project's export and publishing options</p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
            <p>{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-2xl font-semibold mb-4">Export Options</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="export-format">Export Format</Label>
                  <Select
                    value={exportOptions.format}
                    onValueChange={(value) => handleExportOptionChange('format', value)}
                  >
                    <SelectTrigger id="export-format">
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="html">Static HTML</SelectItem>
                      <SelectItem value="wordpress">WordPress Theme</SelectItem>
                      <SelectItem value="custom">Custom CMS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-assets"
                    checked={exportOptions.include_assets}
                    onCheckedChange={(checked) => handleExportOptionChange('include_assets', checked)}
                  />
                  <label htmlFor="include-assets" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Include Assets
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="optimize-images"
                    checked={exportOptions.optimize_images}
                    onCheckedChange={(checked) => handleExportOptionChange('optimize_images', checked)}
                  />
                  <label htmlFor="optimize-images" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Optimize Images
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="minify-code"
                    checked={exportOptions.minify_code}
                    onCheckedChange={(checked) => handleExportOptionChange('minify_code', checked)}
                  />
                  <label htmlFor="minify-code" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Minify Code
                  </label>
                </div>
                <Button onClick={initializeExport} disabled={exportProgress.status === 'in_progress'}>
                  Start Export
                </Button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-2xl font-semibold mb-4">Publishing Options</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="publish-method">Publishing Method</Label>
                  <RadioGroup
                    value={publishingOptions.method}
                    onValueChange={(value) => handlePublishingOptionChange('method', value)}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="ftp" id="ftp" />
                      <Label htmlFor="ftp">FTP</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="hosting_integration" id="hosting_integration" />
                      <Label htmlFor="hosting_integration">Hosting Integration</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="github_pages" id="github_pages" />
                      <Label htmlFor="github_pages">GitHub Pages</Label>
                    </div>
                  </RadioGroup>
                </div>
                <div>
                  <Label htmlFor="destination-url">Destination URL</Label>
                  <Input
                    id="destination-url"
                    value={publishingOptions.destination_url}
                    onChange={(e) => handlePublishingOptionChange('destination_url', e.target.value)}
                    placeholder="https://example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={publishingOptions.credentials.username}
                    onChange={(e) => handlePublishingOptionChange('credentials.username', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={publishingOptions.credentials.password}
                    onChange={(e) => handlePublishingOptionChange('credentials.password', e.target.value)}
                  />
                </div>
                <Button onClick={initiatePublish} disabled={publishProgress.status === 'in_progress'}>
                  Publish Website
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-2xl font-semibold mb-4">Export History</h2>
              <Table>
                <TableCaption>A list of your recent exports</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Format</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {exportHistory.map((export_item: any) => (
                    <TableRow key={export_item.id}>
                      <TableCell>{export_item.id}</TableCell>
                      <TableCell>{new Date(export_item.timestamp).toLocaleString()}</TableCell>
                      <TableCell>{export_item.format}</TableCell>
                      <TableCell>{export_item.status}</TableCell>
                      <TableCell>
                        {export_item.status === 'completed' && (
                          <Button variant="link" onClick={() => downloadExport(export_item.id)}>
                            Download
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-2xl font-semibold mb-4">Current Progress</h2>
              <div className="space-y-6">
                <div>
                  <Label>Export Progress</Label>
                  <Progress value={exportProgress.percentage} className="mt-2" />
                  <p className="text-sm text-gray-500 mt-1">{exportProgress.message}</p>
                </div>
                <div>
                  <Label>Publish Progress</Label>
                  <Progress value={publishProgress.percentage} className="mt-2" />
                  <p className="text-sm text-gray-500 mt-1">{publishProgress.message}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UV_ExportAndPublish;