import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store/main';
import axios from 'axios';

const UV_ExportAndPublish: React.FC = () => {
  const { project_id } = useParams<{ project_id: string }>();
  const dispatch: AppDispatch = useDispatch();
  const currentProject = useSelector((state: RootState) => state.current_project);
  const userAuth = useSelector((state: RootState) => state.user_auth);

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

  useEffect(() => {
    fetchExportHistory();
  }, []);

  const api = axios.create({
    baseURL: 'http://localhost:1337/api',
    headers: {
      Authorization: `Bearer ${userAuth.token}`,
    },
  });

  const fetchExportHistory = async () => {
    try {
      const response = await api.get(`/projects/${project_id}/export/history`);
      setExportHistory(response.data);
    } catch (error) {
      setError('Failed to fetch export history');
    }
  };

  const handleExportOptionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setExportOptions(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handlePublishingOptionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
      const response = await api.post(`/projects/${project_id}/export`, exportOptions);
      const exportId = response.data.export_id;
      setExportProgress({ status: 'in_progress', percentage: 0, message: 'Export started' });
      checkExportProgress(exportId);
    } catch (error) {
      setError('Failed to start export');
      setExportProgress({ status: 'failed', percentage: 0, message: 'Export failed to start' });
    }
  };

  const checkExportProgress = async (exportId: string) => {
    try {
      const response = await api.get(`/projects/${project_id}/export/${exportId}/status`);
      const { status, progress, message } = response.data;
      setExportProgress({ status, percentage: progress, message });
      if (status === 'in_progress') {
        setTimeout(() => checkExportProgress(exportId), 5000);
      } else if (status === 'completed') {
        fetchExportHistory();
      }
    } catch (error) {
      setError('Failed to check export progress');
      setExportProgress({ status: 'failed', percentage: 0, message: 'Failed to check export progress' });
    }
  };

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
      const publishId = response.data.publish_id;
      setPublishProgress({ status: 'in_progress', percentage: 0, message: 'Publishing started' });
      checkPublishProgress(publishId);
    } catch (error) {
      setError('Failed to start publishing');
      setPublishProgress({ status: 'failed', percentage: 0, message: 'Publishing failed to start' });
    }
  };

  const checkPublishProgress = async (publishId: string) => {
    try {
      const response = await api.get(`/projects/${project_id}/publish/${publishId}/status`);
      const { status, progress, message } = response.data;
      setPublishProgress({ status, percentage: progress, message });
      if (status === 'in_progress') {
        setTimeout(() => checkPublishProgress(publishId), 5000);
      }
    } catch (error) {
      setError('Failed to check publishing progress');
      setPublishProgress({ status: 'failed', percentage: 0, message: 'Failed to check publishing progress' });
    }
  };

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Export and Publish</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
            <h2 className="text-xl font-semibold mb-4">Export Options</h2>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="format">
                Export Format
              </label>
              <select
                id="format"
                name="format"
                value={exportOptions.format}
                onChange={handleExportOptionChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option value="html">Static HTML</option>
                <option value="wordpress">WordPress Theme</option>
                <option value="custom">Custom CMS Format</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="include_assets"
                  checked={exportOptions.include_assets}
                  onChange={handleExportOptionChange}
                  className="mr-2"
                />
                <span className="text-sm">Include Assets</span>
              </label>
            </div>
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="optimize_images"
                  checked={exportOptions.optimize_images}
                  onChange={handleExportOptionChange}
                  className="mr-2"
                />
                <span className="text-sm">Optimize Images</span>
              </label>
            </div>
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="minify_code"
                  checked={exportOptions.minify_code}
                  onChange={handleExportOptionChange}
                  className="mr-2"
                />
                <span className="text-sm">Minify Code</span>
              </label>
            </div>
            <button
              onClick={initializeExport}
              disabled={exportProgress.status === 'in_progress'}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Start Export
            </button>
          </div>

          <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
            <h2 className="text-xl font-semibold mb-4">Publishing Options</h2>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="method">
                Publishing Method
              </label>
              <select
                id="method"
                name="method"
                value={publishingOptions.method}
                onChange={handlePublishingOptionChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option value="ftp">FTP</option>
                <option value="hosting_integration">Hosting Integration</option>
                <option value="github_pages">GitHub Pages</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="destination_url">
                Destination URL
              </label>
              <input
                type="text"
                id="destination_url"
                name="destination_url"
                value={publishingOptions.destination_url}
                onChange={handlePublishingOptionChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="https://yourdomain.com"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="credentials.username">
                Username
              </label>
              <input
                type="text"
                id="credentials.username"
                name="credentials.username"
                value={publishingOptions.credentials.username}
                onChange={handlePublishingOptionChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="credentials.password">
                Password
              </label>
              <input
                type="password"
                id="credentials.password"
                name="credentials.password"
                value={publishingOptions.credentials.password}
                onChange={handlePublishingOptionChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <button
              onClick={initiatePublish}
              disabled={publishProgress.status === 'in_progress'}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Publish Website
            </button>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Export Progress</h2>
          <div className="bg-gray-200 rounded-full h-4 dark:bg-gray-700">
            <div
              className="bg-blue-600 h-4 rounded-full"
              style={{ width: `${exportProgress.percentage}%` }}
            ></div>
          </div>
          <p className="mt-2">{exportProgress.message}</p>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Publishing Progress</h2>
          <div className="bg-gray-200 rounded-full h-4 dark:bg-gray-700">
            <div
              className="bg-green-600 h-4 rounded-full"
              style={{ width: `${publishProgress.percentage}%` }}
            ></div>
          </div>
          <p className="mt-2">{publishProgress.message}</p>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Export History</h2>
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Date</th>
                <th className="py-2 px-4 border-b">Format</th>
                <th className="py-2 px-4 border-b">Status</th>
                <th className="py-2 px-4 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {exportHistory.map((export_item: any) => (
                <tr key={export_item.id}>
                  <td className="py-2 px-4 border-b">{new Date(export_item.timestamp).toLocaleString()}</td>
                  <td className="py-2 px-4 border-b">{export_item.format}</td>
                  <td className="py-2 px-4 border-b">{export_item.status}</td>
                  <td className="py-2 px-4 border-b">
                    {export_item.status === 'completed' && (
                      <button
                        onClick={() => downloadExport(export_item.id)}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-xs"
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
    </>
  );
};

export default UV_ExportAndPublish;