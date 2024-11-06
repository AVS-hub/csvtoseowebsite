import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch, set_current_project } from '@/store/main';
import axios from 'axios';

const UV_ProjectOverview: React.FC = () => {
  const { project_id } = useParams<{ project_id: string }>();
  const dispatch: AppDispatch = useDispatch();
  const currentProject = useSelector((state: RootState) => state.current_project);
  const userAuth = useSelector((state: RootState) => state.user_auth);

  const [siteStructure, setSiteStructure] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [collaborators, setCollaborators] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjectDetails = useCallback(async () => {
    try {
      setIsLoading(true);
      await dispatch(set_current_project(project_id!));
      const [structureRes, activityRes, collaboratorsRes] = await Promise.all([
        axios.get(`http://localhost:1337/api/projects/${project_id}/structure`),
        axios.get(`http://localhost:1337/api/projects/${project_id}/activity`),
        axios.get(`http://localhost:1337/api/projects/${project_id}/collaborators`)
      ]);
      setSiteStructure(structureRes.data);
      setRecentActivity(activityRes.data);
      setCollaborators(collaboratorsRes.data);
      setIsLoading(false);
    } catch (err) {
      setError('Failed to fetch project details. Please try again.');
      setIsLoading(false);
    }
  }, [project_id, dispatch]);

  useEffect(() => {
    fetchProjectDetails();
  }, [fetchProjectDetails]);

  const handleGenerateContent = async () => {
    try {
      await axios.post(`http://localhost:1337/api/projects/${project_id}/generate-content`);
      // Refresh project details after content generation
      fetchProjectDetails();
    } catch (err) {
      setError('Failed to generate content. Please try again.');
    }
  };

  const handleExportWebsite = async () => {
    try {
      const response = await axios.post(`http://localhost:1337/api/projects/${project_id}/export`);
      // Handle the export response, e.g., provide a download link
      console.log('Export initiated:', response.data);
    } catch (err) {
      setError('Failed to export website. Please try again.');
    }
  };

  const handleInviteCollaborator = async (email: string) => {
    try {
      await axios.post(`http://localhost:1337/api/projects/${project_id}/collaborators`, { email });
      // Refresh collaborators list
      const collaboratorsRes = await axios.get(`http://localhost:1337/api/projects/${project_id}/collaborators`);
      setCollaborators(collaboratorsRes.data);
    } catch (err) {
      setError('Failed to invite collaborator. Please try again.');
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Project Header */}
          <div className="bg-gray-50 px-4 py-5 border-b border-gray-200 sm:px-6">
            <h1 className="text-2xl font-bold text-gray-900">{currentProject?.name}</h1>
            <p className="mt-1 text-sm text-gray-500">
              Created: {new Date(currentProject?.created_at ?? 0).toLocaleDateString()} | 
              Last Modified: {new Date(currentProject?.updated_at ?? 0).toLocaleDateString()}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900">Project Progress</h2>
            <div className="mt-2 relative pt-1">
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                <div style={{ width: `${currentProject?.progress ?? 0}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"></div>
              </div>
              <span className="text-sm font-semibold text-gray-700">{currentProject?.progress ?? 0}% Complete</span>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
            <button onClick={handleGenerateContent} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Generate Content
            </button>
            <Link to={`/projects/${project_id}/preview`} className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
              Preview Website
            </Link>
            <button onClick={handleExportWebsite} className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500">
              Export Website
            </button>
            <Link to={`/projects/${project_id}/settings`} className="ml-3 inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Project Settings
            </Link>
          </div>

          {/* Site Structure */}
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900">Site Structure</h2>
            <div className="mt-2 border-2 border-gray-200 rounded-md p-4">
              {/* Implement a recursive function to render the site structure tree */}
              {siteStructure.map((page) => (
                <div key={page.page_id} className="ml-4">
                  <Link to={`/projects/${project_id}/content/${page.page_id}`} className="text-blue-600 hover:underline">
                    {page.title}
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* SEO Health Score */}
          <div className="px-4 py-5 bg-gray-50 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900">SEO Health Score</h2>
            <div className="mt-2">
              <div className="flex items-center">
                <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center text-white text-2xl font-bold">
                  {currentProject?.seo_score ?? 0}
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">Overall SEO Score</p>
                  <p className="text-sm text-gray-500">Based on various factors including content quality, keywords, and structure.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity Log */}
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
            <ul className="mt-2 divide-y divide-gray-200">
              {recentActivity.map((activity) => (
                <li key={activity.id} className="py-4">
                  <div className="flex space-x-3">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium">{activity.user}</h3>
                        <p className="text-sm text-gray-500">{new Date(activity.timestamp).toLocaleString()}</p>
                      </div>
                      <p className="text-sm text-gray-500">{activity.description}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Collaborators */}
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900">Collaborators</h2>
            <ul className="mt-2 divide-y divide-gray-200">
              {collaborators.map((collaborator) => (
                <li key={collaborator.user_id} className="py-4 flex">
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{collaborator.name}</p>
                    <p className="text-sm text-gray-500">{collaborator.email}</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-900">Invite a new collaborator</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const email = (e.target as HTMLFormElement).email.value;
                handleInviteCollaborator(email);
              }} className="mt-2 flex">
                <input
                  type="email"
                  name="email"
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Enter email address"
                />
                <button type="submit" className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  Invite
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UV_ProjectOverview;