import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store/main';
import axios from 'axios';

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

  const handleExportOptionsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setExportOptions(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handlePublishingOptionsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
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
      }
    } catch (error) {
      setError('Failed to check publishing progress');
    }
  };

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Export and Publish</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
            <p>{error}</p>
          </div>
        )}

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
              onChange={handleExportOptionsChange}
              className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
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
                onChange={handleExportOptionsChange}
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
                onChange={handleExportOptionsChange}
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
                onChange={handleExportOptionsChange}
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

        {exportProgress.status !== 'idle' && (
          <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
            <h2 className="text-xl font-semibold mb-4">Export Progress</h2>
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mb-2">
              <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${exportProgress.percentage}%` }}></div>
            </div>
            <p>{exportProgress.message}</p>
          </div>
        )}

        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <h2 className="text-xl font-semibold mb-4">Publishing Options</h2>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="publish_method">
              Publishing Method
            </label>
            <select
              id="publish_method"
              name="method"
              value={publishingOptions.method}
              onChange={handlePublishingOptionsChange}
              className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
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
              onChange={handlePublishingOptionsChange}
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

        {publishProgress.status !== 'idle' && (
          <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
            <h2 className="text-xl font-semibold mb-4">Publishing Progress</h2>
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mb-2">
              <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${publishProgress.percentage}%` }}></div>
            </div>
            <p>{publishProgress.message}</p>
          </div>
        )}

        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <h2 className="text-xl font-semibold mb-4">Export History</h2>
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Format</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {exportHistory.map((export_item: any) => (
                <tr key={export_item.id}>
                  <td className="border px-4 py-2">{new Date(export_item.timestamp).toLocaleString()}</td>
                  <td className="border px-4 py-2">{export_item.format}</td>
                  <td className="border px-4 py-2">{export_item.status}</td>
                  <td className="border px-4 py-2">
                    {export_item.status === 'completed' && (
                      <button
                        onClick={() => downloadExport(export_item.id)}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline"
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