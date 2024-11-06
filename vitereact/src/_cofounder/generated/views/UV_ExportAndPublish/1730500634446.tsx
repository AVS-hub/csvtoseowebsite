import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { RootState, AppDispatch } from '@/store/main';
import { debounce } from 'lodash';

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
        <h1 className="text-3xl font-bold mb-8">Export and Publish: {currentProject?.name}</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
            <p>{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-4">Export Options</h2>
            <form>
              <div className="mb-4">
                <label className="block mb-2">Format:</label>
                <select
                  name="format"
                  value={exportOptions.format}
                  onChange={handleExportOptionChange}
                  className="w-full p-2 border rounded"
                >
                  <option value="html">Static HTML</option>
                  <option value="wordpress">WordPress Theme</option>
                  <option value="custom">Custom CMS</option>
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
                  Include Assets
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
                  Optimize Images
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

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-4">Publishing Options</h2>
            <form>
              <div className="mb-4">
                <label className="block mb-2">Publishing Method:</label>
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
              <div className="mb-4">
                <label className="block mb-2">Destination URL:</label>
                <input
                  type="text"
                  name="destination_url"
                  value={publishingOptions.destination_url}
                  onChange={handlePublishingOptionChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2">Username:</label>
                <input
                  type="text"
                  name="credentials.username"
                  value={publishingOptions.credentials.username}
                  onChange={handlePublishingOptionChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2">Password:</label>
                <input
                  type="password"
                  name="credentials.password"
                  value={publishingOptions.credentials.password}
                  onChange={handlePublishingOptionChange}
                  className="w-full p-2 border rounded"
                />
              </div>
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

        <div className="mt-12">
          <h2 className="text-2xl font-semibold mb-4">Export History</h2>
          <table className="w-full bg-white shadow rounded-lg">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-6 py-3 text-left">ID</th>
                <th className="px-6 py-3 text-left">Timestamp</th>
                <th className="px-6 py-3 text-left">Format</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {exportHistory.map((export_item: any) => (
                <tr key={export_item.id} className="border-b">
                  <td className="px-6 py-4">{export_item.id}</td>
                  <td className="px-6 py-4">{new Date(export_item.timestamp).toLocaleString()}</td>
                  <td className="px-6 py-4">{export_item.format}</td>
                  <td className="px-6 py-4">{export_item.status}</td>
                  <td className="px-6 py-4">
                    {export_item.status === 'completed' && (
                      <button
                        onClick={() => downloadExport(export_item.id)}
                        className="text-blue-500 hover:text-blue-700"
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