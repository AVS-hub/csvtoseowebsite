import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { RootState } from '@/store/main';

const UV_ExportAndPublish: React.FC = () => {
  const { project_id } = useParams<{ project_id: string }>();
  const { token } = useSelector((state: RootState) => state.user_auth);
  const currentProject = useSelector((state: RootState) => state.current_project);

  const [exportOptions, setExportOptions] = useState({
    format: 'html',
    includeAssets: true,
    optimizeImages: true,
    minifyCode: true,
  });

  const [publishingOptions, setPublishingOptions] = useState({
    method: 'ftp',
    destinationUrl: '',
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
  const [exportId, setExportId] = useState<string | null>(null);
  const [publishId, setPublishId] = useState<string | null>(null);

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
      console.error('Failed to fetch export history:', error);
    }
  };

  const handleExportOptionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setExportOptions(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handlePublishOptionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
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
      const response = await axios.post(`http://localhost:1337/api/projects/${project_id}/export`, exportOptions, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setExportId(response.data.export_id);
      setExportProgress({ status: 'in_progress', percentage: 0, message: 'Export started' });
      checkExportProgress(response.data.export_id);
    } catch (error) {
      console.error('Failed to initialize export:', error);
      setExportProgress({ status: 'failed', percentage: 0, message: 'Failed to start export' });
    }
  };

  const checkExportProgress = async (exportId: string) => {
    try {
      const response = await axios.get(`http://localhost:1337/api/projects/${project_id}/export/${exportId}/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setExportProgress({
        status: response.data.status,
        percentage: response.data.progress,
        message: response.data.message || '',
      });
      if (response.data.status === 'completed') {
        fetchExportHistory();
      } else if (response.data.status !== 'failed') {
        setTimeout(() => checkExportProgress(exportId), 5000);
      }
    } catch (error) {
      console.error('Failed to check export progress:', error);
      setExportProgress({ status: 'failed', percentage: 0, message: 'Failed to check export progress' });
    }
  };

  const downloadExport = async (exportId: string) => {
    try {
      const response = await axios.get(`http://localhost:1337/api/projects/${project_id}/export/${exportId}/download`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${currentProject?.name || 'project'}_export.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Failed to download export:', error);
    }
  };

  const initiatePublish = async () => {
    try {
      const response = await axios.post(`http://localhost:1337/api/projects/${project_id}/publish`, publishingOptions, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPublishId(response.data.publish_id);
      setPublishProgress({ status: 'in_progress', percentage: 0, message: 'Publishing started' });
      checkPublishProgress(response.data.publish_id);
    } catch (error) {
      console.error('Failed to initiate publishing:', error);
      setPublishProgress({ status: 'failed', percentage: 0, message: 'Failed to start publishing' });
    }
  };

  const checkPublishProgress = async (publishId: string) => {
    try {
      const response = await axios.get(`http://localhost:1337/api/projects/${project_id}/publish/${publishId}/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPublishProgress({
        status: response.data.status,
        percentage: response.data.progress,
        message: response.data.message || '',
      });
      if (response.data.status !== 'completed' && response.data.status !== 'failed') {
        setTimeout(() => checkPublishProgress(publishId), 5000);
      }
    } catch (error) {
      console.error('Failed to check publishing progress:', error);
      setPublishProgress({ status: 'failed', percentage: 0, message: 'Failed to check publishing progress' });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Export and Publish</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Export Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Export Options</h2>
          <form>
            <div className="mb-4">
              <label className="block mb-2">Format</label>
              <select
                name="format"
                value={exportOptions.format}
                onChange={handleExportOptionChange}
                className="w-full p-2 border rounded"
              >
                <option value="html">HTML</option>
                <option value="wordpress">WordPress</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="includeAssets"
                  checked={exportOptions.includeAssets}
                  onChange={handleExportOptionChange}
                  className="mr-2"
                />
                Include Assets
              </label>
            </div>
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="optimizeImages"
                  checked={exportOptions.optimizeImages}
                  onChange={handleExportOptionChange}
                  className="mr-2"
                />
                Optimize Images
              </label>
            </div>
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="minifyCode"
                  checked={exportOptions.minifyCode}
                  onChange={handleExportOptionChange}
                  className="mr-2"
                />
                Minify Code
              </label>
            </div>
            <button
              type="button"
              onClick={initializeExport}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              disabled={exportProgress.status === 'in_progress'}
            >
              Start Export
            </button>
          </form>
          
          {exportProgress.status !== 'idle' && (
            <div className="mt-4">
              <div className="mb-2">Export Progress: {exportProgress.percentage}%</div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: `${exportProgress.percentage}%` }}
                ></div>
              </div>
              <p className="mt-2">{exportProgress.message}</p>
            </div>
          )}
        </div>

        {/* Publish Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Publishing Options</h2>
          <form>
            <div className="mb-4">
              <label className="block mb-2">Publishing Method</label>
              <select
                name="method"
                value={publishingOptions.method}
                onChange={handlePublishOptionChange}
                className="w-full p-2 border rounded"
              >
                <option value="ftp">FTP</option>
                <option value="hosting_integration">Hosting Integration</option>
                <option value="github_pages">GitHub Pages</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block mb-2">Destination URL</label>
              <input
                type="text"
                name="destinationUrl"
                value={publishingOptions.destinationUrl}
                onChange={handlePublishOptionChange}
                className="w-full p-2 border rounded"
              />
            </div>
            {publishingOptions.method === 'ftp' && (
              <>
                <div className="mb-4">
                  <label className="block mb-2">FTP Username</label>
                  <input
                    type="text"
                    name="credentials.username"
                    value={publishingOptions.credentials.username}
                    onChange={handlePublishOptionChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-2">FTP Password</label>
                  <input
                    type="password"
                    name="credentials.password"
                    value={publishingOptions.credentials.password}
                    onChange={handlePublishOptionChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </>
            )}
            <button
              type="button"
              onClick={initiatePublish}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              disabled={publishProgress.status === 'in_progress'}
            >
              Publish Website
            </button>
          </form>
          
          {publishProgress.status !== 'idle' && (
            <div className="mt-4">
              <div className="mb-2">Publishing Progress: {publishProgress.percentage}%</div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-green-600 h-2.5 rounded-full"
                  style={{ width: `${publishProgress.percentage}%` }}
                ></div>
              </div>
              <p className="mt-2">{publishProgress.message}</p>
            </div>
          )}
        </div>
      </div>

      {/* Export History */}
      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-4">Export History</h2>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Date</th>
              <th className="p-2 text-left">Format</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {exportHistory.map((export: any) => (
              <tr key={export.id} className="border-b">
                <td className="p-2">{new Date(export.timestamp).toLocaleString()}</td>
                <td className="p-2">{export.format}</td>
                <td className="p-2">{export.status}</td>
                <td className="p-2">
                  {export.status === 'completed' && (
                    <button
                      onClick={() => downloadExport(export.id)}
                      className="bg-blue-500 text-white px-2 py-1 rounded text-sm hover:bg-blue-600"
                    >
                      Download
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UV_ExportAndPublish;