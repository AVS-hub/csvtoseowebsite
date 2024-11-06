import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { RootState } from '@/store/main';

const UV_ExportAndPublish: React.FC = () => {
  const { project_id } = useParams<{ project_id: string }>();
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

  useEffect(() => {
    fetchExportHistory();
  }, []);

  const fetchExportHistory = async () => {
    try {
      const response = await api.get(`/projects/${project_id}/export/history`);
      setExportHistory(response.data);
    } catch (err) {
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
      const { export_id } = response.data;
      setExportProgress({ status: 'in_progress', percentage: 0, message: 'Export started' });
      pollExportProgress(export_id);
    } catch (err) {
      setError('Failed to start export');
    }
  };

  const pollExportProgress = async (export_id: string) => {
    const interval = setInterval(async () => {
      try {
        const response = await api.get(`/projects/${project_id}/export/${export_id}/status`);
        const { status, progress, message } = response.data;
        setExportProgress({ status, percentage: progress, message });

        if (status === 'completed' || status === 'failed') {
          clearInterval(interval);
          if (status === 'completed') {
            fetchExportHistory();
          }
        }
      } catch (err) {
        clearInterval(interval);
        setError('Failed to check export progress');
      }
    }, 5000);
  };

  const downloadExport = async (export_id: string) => {
    try {
      const response = await api.get(`/projects/${project_id}/export/${export_id}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `export_${export_id}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Failed to download export');
    }
  };

  const initiatePublish = async () => {
    try {
      const response = await api.post(`/projects/${project_id}/publish`, publishingOptions);
      const { publish_id } = response.data;
      setPublishProgress({ status: 'in_progress', percentage: 0, message: 'Publishing started' });
      pollPublishProgress(publish_id);
    } catch (err) {
      setError('Failed to start publishing');
    }
  };

  const pollPublishProgress = async (publish_id: string) => {
    const interval = setInterval(async () => {
      try {
        const response = await api.get(`/projects/${project_id}/publish/${publish_id}/status`);
        const { status, progress, message } = response.data;
        setPublishProgress({ status, percentage: progress, message });

        if (status === 'completed' || status === 'failed') {
          clearInterval(interval);
        }
      } catch (err) {
        clearInterval(interval);
        setError('Failed to check publishing progress');
      }
    }, 5000);
  };

  return (
    <>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Export and Publish</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
            <p>{error}</p>
          </div>
        )}

        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Export Options</h2>
          <div className="space-y-4">
            <div>
              <label className="block mb-2">Export Format</label>
              <select
                name="format"
                value={exportOptions.format}
                onChange={handleExportOptionChange}
                className="w-full p-2 border rounded"
              >
                <option value="html">Static HTML</option>
                <option value="wordpress">WordPress Theme</option>
                <option value="custom">Custom CMS Format</option>
              </select>
            </div>
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="include_assets"
                  checked={exportOptions.include_assets}
                  onChange={handleExportOptionChange}
                  className="mr-2"
                />
                Include Assets
              </label>
            </div>
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="optimize_images"
                  checked={exportOptions.optimize_images}
                  onChange={handleExportOptionChange}
                  className="mr-2"
                />
                Optimize Images
              </label>
            </div>
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="minify_code"
                  checked={exportOptions.minify_code}
                  onChange={handleExportOptionChange}
                  className="mr-2"
                />
                Minify Code
              </label>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Publishing Options</h2>
          <div className="space-y-4">
            <div>
              <label className="block mb-2">Publishing Method</label>
              <select
                name="method"
                value={publishingOptions.method}
                onChange={handlePublishingOptionChange}
                className="w-full p-2 border rounded"
              >
                <option value="ftp">FTP</option>
                <option value="hosting_integration">Hosting Integration</option>
                <option value="github_pages">GitHub Pages</option>
              </select>
            </div>
            <div>
              <label className="block mb-2">Destination URL</label>
              <input
                type="text"
                name="destination_url"
                value={publishingOptions.destination_url}
                onChange={handlePublishingOptionChange}
                className="w-full p-2 border rounded"
                placeholder="https://example.com"
              />
            </div>
            {publishingOptions.method === 'ftp' && (
              <>
                <div>
                  <label className="block mb-2">FTP Username</label>
                  <input
                    type="text"
                    name="credentials.username"
                    value={publishingOptions.credentials.username}
                    onChange={handlePublishingOptionChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block mb-2">FTP Password</label>
                  <input
                    type="password"
                    name="credentials.password"
                    value={publishingOptions.credentials.password}
                    onChange={handlePublishingOptionChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex space-x-4 mb-8">
          <button
            onClick={initializeExport}
            disabled={exportProgress.status === 'in_progress'}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            Start Export
          </button>
          <button
            onClick={initiatePublish}
            disabled={publishProgress.status === 'in_progress'}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
          >
            Publish Website
          </button>
        </div>

        {exportProgress.status !== 'idle' && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-2">Export Progress</h3>
            <div className="bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${exportProgress.percentage}%` }}
              ></div>
            </div>
            <p className="mt-2">{exportProgress.message}</p>
          </div>
        )}

        {publishProgress.status !== 'idle' && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-2">Publish Progress</h3>
            <div className="bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div
                className="bg-green-600 h-2.5 rounded-full"
                style={{ width: `${publishProgress.percentage}%` }}
              ></div>
            </div>
            <p className="mt-2">{publishProgress.message}</p>
          </div>
        )}

        <div>
          <h2 className="text-2xl font-semibold mb-4">Export History</h2>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">ID</th>
                <th className="border p-2">Date</th>
                <th className="border p-2">Format</th>
                <th className="border p-2">Status</th>
                <th className="border p-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {exportHistory.map((export_item: any) => (
                <tr key={export_item.id}>
                  <td className="border p-2">{export_item.id}</td>
                  <td className="border p-2">{new Date(export_item.timestamp).toLocaleString()}</td>
                  <td className="border p-2">{export_item.format}</td>
                  <td className="border p-2">{export_item.status}</td>
                  <td className="border p-2">
                    {export_item.status === 'completed' && (
                      <button
                        onClick={() => downloadExport(export_item.id)}
                        className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
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