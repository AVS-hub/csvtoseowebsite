import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch, set_current_project } from '@/store/main';
import axios from 'axios';
import { FiPlus, FiMinus, FiEdit2, FiEye, FiDownload, FiSettings, FiUserPlus } from 'react-icons/fi';

const UV_ProjectOverview: React.FC = () => {
  const { project_id } = useParams<{ project_id: string }>();
  const dispatch: AppDispatch = useDispatch();
  const userAuth = useSelector((state: RootState) => state.user_auth);
  const currentProject = useSelector((state: RootState) => state.current_project);

  const [projectDetails, setProjectDetails] = useState<any>(null);
  const [siteStructure, setSiteStructure] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [collaborators, setCollaborators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (project_id) {
      fetchProjectDetails();
    }
  }, [project_id]);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:1337/api/projects/${project_id}`, {
        headers: { Authorization: `Bearer ${userAuth.token}` }
      });
      setProjectDetails(response.data);
      setSiteStructure(response.data.site_structure || []);
      setRecentActivity(response.data.recent_activity || []);
      setCollaborators(response.data.collaborators || []);
      dispatch(set_current_project(response.data));
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch project details. Please try again.');
      setLoading(false);
    }
  };

  const updateSiteStructure = async (newStructure: any[]) => {
    try {
      await axios.put(`http://localhost:1337/api/projects/${project_id}/structure`, { structure: newStructure }, {
        headers: { Authorization: `Bearer ${userAuth.token}` }
      });
      setSiteStructure(newStructure);
    } catch (err) {
      setError('Failed to update site structure. Please try again.');
    }
  };

  const generateContent = async () => {
    try {
      await axios.post(`http://localhost:1337/api/projects/${project_id}/generate-content`, {}, {
        headers: { Authorization: `Bearer ${userAuth.token}` }
      });
      // Refresh project details after content generation
      fetchProjectDetails();
    } catch (err) {
      setError('Failed to generate content. Please try again.');
    }
  };

  const exportWebsite = async () => {
    try {
      const response = await axios.post(`http://localhost:1337/api/projects/${project_id}/export`, {}, {
        headers: { Authorization: `Bearer ${userAuth.token}` }
      });
      window.location.href = response.data.download_url;
    } catch (err) {
      setError('Failed to export website. Please try again.');
    }
  };

  const inviteCollaborator = async (email: string) => {
    try {
      await axios.post(`http://localhost:1337/api/projects/${project_id}/collaborators`, { email }, {
        headers: { Authorization: `Bearer ${userAuth.token}` }
      });
      // Refresh collaborators list
      fetchProjectDetails();
    } catch (err) {
      setError('Failed to invite collaborator. Please try again.');
    }
  };

  const renderSiteStructure = (pages: any[], level = 0) => {
    return (
      <ul className={`ml-${level * 4}`}>
        {pages.map((page) => (
          <li key={page.page_id} className="my-2">
            <div className="flex items-center">
              <span className="mr-2">{page.title}</span>
              <button onClick={() => {/* Implement page edit logic */}} className="p-1 text-gray-500 hover:text-gray-700">
                <FiEdit2 size={14} />
              </button>
              <button onClick={() => {/* Implement add subpage logic */}} className="p-1 text-gray-500 hover:text-gray-700">
                <FiPlus size={14} />
              </button>
              <button onClick={() => {/* Implement remove page logic */}} className="p-1 text-gray-500 hover:text-gray-700">
                <FiMinus size={14} />
              </button>
            </div>
            {page.children && renderSiteStructure(page.children, level + 1)}
          </li>
        ))}
      </ul>
    );
  };

  if (loading) {
    return <div className="flex justify-center items-center h-full">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          {/* Project Header */}
          <div className="px-4 py-5 sm:px-6">
            <h1 className="text-2xl font-bold text-gray-900">{projectDetails?.name}</h1>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              {projectDetails?.type} • Created on {new Date(projectDetails?.created_at).toLocaleDateString()}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="px-4 sm:px-6">
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-teal-600 bg-teal-200">
                    Progress
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold inline-block text-teal-600">
                    {projectDetails?.progress}%
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-teal-200">
                <div style={{ width: `${projectDetails?.progress}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-teal-500"></div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="px-4 py-3 sm:px-6 flex flex-wrap gap-2">
            <button onClick={generateContent} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Generate Content
            </button>
            <Link to={`/projects/${project_id}/content/preview`} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-indigo-600 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              <FiEye className="mr-2" /> Preview
            </Link>
            <button onClick={exportWebsite} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-indigo-600 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              <FiDownload className="mr-2" /> Export
            </button>
            <Link to={`/projects/${project_id}/settings`} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
              <FiSettings className="mr-2" /> Settings
            </Link>
          </div>

          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Site Structure */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Site Structure</h2>
                {renderSiteStructure(siteStructure)}
              </div>

              <div>
                {/* SEO Health Score */}
                <div className="mb-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-2">SEO Health Score</h2>
                  <div className="bg-green-100 rounded-full p-2 text-center">
                    <span className="text-2xl font-bold text-green-800">{projectDetails?.seo_score}/100</span>
                  </div>
                </div>

                {/* Recent Activity */}
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-2">Recent Activity</h2>
                  <ul className="space-y-2">
                    {recentActivity.map((activity) => (
                      <li key={activity.id} className="text-sm text-gray-600">
                        {activity.description} - {new Date(activity.timestamp).toLocaleString()}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Collaborators */}
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Collaborators</h2>
            <ul className="space-y-2">
              {collaborators.map((collaborator) => (
                <li key={collaborator.user_id} className="flex items-center justify-between">
                  <span>{collaborator.name} ({collaborator.email})</span>
                  <span className="text-sm text-gray-500">{collaborator.role}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4">
              <button onClick={() => {/* Implement invite modal logic */}} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                <FiUserPlus className="mr-2" /> Invite Collaborator
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UV_ProjectOverview;