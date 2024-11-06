import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { RootState } from '@/store/main';
import { debounce } from 'lodash';
import { toast, ToastContainer } from 'react-toastify';

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

  const api = useMemo(() => axios.create({
    baseURL: 'http://localhost:1337/api',
    headers: { Authorization: `Bearer ${token}` },
  }), [token]);

  const fetchExportHistory = useCallback(async () => {
    try {
      const response = await api.get(`/projects/${project_id}/export/history`);
      setExportHistory(response.data);
    } catch (err) {
      console.error('Failed to fetch export history:', err);
      setError('Failed to fetch export history. Please try again.');
    }
  }, [api, project_id]);

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
    setPublishingOptions(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const initializeExport = async () => {
    try {
      const response = await api.post(`/projects/${project_id}/export`, exportOptions);
      setExportProgress({ status: 'in_progress', percentage: 0, message: 'Export started' });
      checkExportProgress(response.data.export_id);
    } catch (err) {
      console.error('Failed to initialize export:', err);
      setError('Failed to start export. Please try again.');
      setExportProgress({ status: 'failed', percentage: 0, message: 'Export failed to start' });
    }
  };

  const checkExportProgress = useCallback(debounce(async (exportId: string) => {
    try {
      const response = await api.get(`/projects/${project_id}/export/${exportId}/status`);
      setExportProgress(response.data);
      if (response.data.status === 'completed' || response.data.status === 'failed') {
        fetchExportHistory();
      } else {
        checkExportProgress(exportId);
      }
    } catch (err) {
      console.error('Failed to check export progress:', err);
      setError('Failed to check export progress. Please try again.');
    }
  }, 5000), [api, project_id, fetchExportHistory]);

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
    } catch (err) {
      console.error('Failed to download export:', err);
      setError('Failed to download export. Please try again.');
    }
  };

  const initiatePublish = async () => {
    try {
      const response = await api.post(`/projects/${project_id}/publish`, publishingOptions);
      setPublishProgress({ status: 'in_progress', percentage: 0, message: 'Publishing started' });
      checkPublishProgress(response.data.publish_id);
    } catch (err) {
      console.error('Failed to initiate publish:', err);
      setError('Failed to start publishing. Please try again.');
      setPublishProgress({ status: 'failed', percentage: 0, message: 'Publishing failed to start' });
    }
  };

  const checkPublishProgress = useCallback(debounce(async (publishId: string) => {
    try {
      const response = await api.get(`/projects/${project_id}/publish/${publishId}/status`);
      setPublishProgress(response.data);
      if (response.data.status !== 'completed' && response.data.status !== 'failed') {
        checkPublishProgress(publishId);
      }
    } catch (err) {
      console.error('Failed to check publish progress:', err);
      setError('Failed to check publishing progress. Please try again.');
    }
  }, 5000), [api, project_id]);

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Export and Publish: {currentProject?.name}</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
            <h2 className="text-2xl font-semibold mb-4">Export Options</h2>
            <form>
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
                    className="form-checkbox h-5 w-5 text-blue-600"
                  />
                  <span className="ml-2 text-gray-700">Include Assets</span>
                </label>
              </div>
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="optimize_images"
                    checked={exportOptions.optimize_images}
                    onChange={handleExportOptionChange}
                    className="form-checkbox h-5 w-5 text-blue-600"
                  />
                  <span className="ml-2 text-gray-700">Optimize Images</span>
                </label>
              </div>
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="minify_code"
                    checked={exportOptions.minify_code}
                    onChange={handleExportOptionChange}
                    className="form-checkbox h-5 w-5 text-blue-600"
                  />
                  <span className="ml-2 text-gray-700">Minify Code</span>
                </label>
              </div>
              <button
                type="button"
                onClick={initializeExport}
                disabled={exportProgress.status === 'in_progress'}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Start Export
              </button>
            </form>
          </div>

          <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
            <h2 className="text-2xl font-semibold mb-4">Publishing Options</h2>
            <form>
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
                  placeholder="https://example.com"
                />
              </div>
              {publishingOptions.method === 'ftp' && (
                <>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                      FTP Username
                    </label>
                    <input
                      type="text"
                      id="username"
                      name="credentials.username"
                      value={publishingOptions.credentials.username}
                      onChange={handlePublishingOptionChange}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                      FTP Password
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="credentials.password"
                      value={publishingOptions.credentials.password}
                      onChange={handlePublishingOptionChange}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                  </div>
                </>
              )}
              <button
                type="button"
                onClick={initiatePublish}
                disabled={publishProgress.status === 'in_progress'}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Publish Website
              </button>
            </form>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Export Progress</h2>
          <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
            <div className="mb-4">
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                      {exportProgress.status}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold inline-block text-blue-600">
                      {exportProgress.percentage}%
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                  <div
                    style={{ width: `${exportProgress.percentage}%` }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                  ></div>
                </div>
              </div>
              <p className="text-gray-700">{exportProgress.message}</p>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Publishing Progress</h2>
          <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
            <div className="mb-4">
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-green-600 bg-green-200">
                      {publishProgress.status}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold inline-block text-green-600">
                      {publishProgress.percentage}%
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-green-200">
                  <div
                    style={{ width: `${publishProgress.percentage}%` }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
                  ></div>
                </div>
              </div>
              <p className="text-gray-700">{publishProgress.message}</p>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Export History</h2>
          <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
            <table className="min-w-full leading-normal">
              <thead>
                <tr>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Format
                  </th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {exportHistory.map((export_item: any) => (
                  <tr key={export_item.id}>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                      {new Date(export_item.timestamp).toLocaleString()}
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                      {export_item.format}
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        export_item.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {export_item.status}
                      </span>
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                      {export_item.status === 'completed' && (
                        <button
                          onClick={() => downloadExport(export_item.id)}
                          className="text-blue-600 hover:text-blue-900"
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
      </div>
      <ToastContainer />
    </>
  );
};

export default UV_ExportAndPublish;