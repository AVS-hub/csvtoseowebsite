import React, { useState, useEffect } from 'react';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjectData = async () => {
      setLoading(true);
      setError(null);
      try {
        await dispatch(set_current_project(project_id!));
        const [structureRes, activityRes, collaboratorsRes] = await Promise.all([
          axios.get(`http://localhost:1337/api/projects/${project_id}/structure`),
          axios.get(`http://localhost:1337/api/projects/${project_id}/activity`),
          axios.get(`http://localhost:1337/api/projects/${project_id}/collaborators`)
        ]);
        setSiteStructure(structureRes.data);
        setRecentActivity(activityRes.data);
        setCollaborators(collaboratorsRes.data);
      } catch (err) {
        setError('Failed to load project data. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (project_id) {
      fetchProjectData();
    }
  }, [project_id, dispatch]);

  const handleGenerateContent = async () => {
    try {
      await axios.post(`http://localhost:1337/api/projects/${project_id}/generate-content`);
      // Handle success (e.g., show a notification)
    } catch (err) {
      console.error(err);
      // Handle error (e.g., show an error message)
    }
  };

  const handleExportWebsite = async () => {
    try {
      const response = await axios.post(`http://localhost:1337/api/projects/${project_id}/export`);
      // Handle success (e.g., provide download link)
      console.log(response.data);
    } catch (err) {
      console.error(err);
      // Handle error (e.g., show an error message)
    }
  };

  const handleInviteCollaborator = async (email: string) => {
    try {
      await axios.post(`http://localhost:1337/api/projects/${project_id}/collaborators`, { email });
      // Handle success (e.g., show a success message, update collaborators list)
    } catch (err) {
      console.error(err);
      // Handle error (e.g., show an error message)
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Project Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{currentProject?.name}</h1>
          <p className="text-sm text-gray-500">
            Created: {new Date(currentProject?.created_at!).toLocaleDateString()} | 
            Last Modified: {new Date(currentProject?.updated_at!).toLocaleDateString()}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                  Project Progress
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold inline-block text-blue-600">
                  {currentProject?.progress || 0}%
                </span>
              </div>
            </div>
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
              <div style={{ width: `${currentProject?.progress || 0}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"></div>
            </div>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="mb-8 flex space-x-4">
          <button
            onClick={handleGenerateContent}
            className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Generate Content
          </button>
          <Link
            to={`/projects/${project_id}/preview`}
            className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Preview Website
          </Link>
          <button
            onClick={handleExportWebsite}
            className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Export Website
          </button>
          <Link
            to={`/projects/${project_id}/settings`}
            className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Project Settings
          </Link>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-3 gap-8">
          {/* Site Structure */}
          <div className="col-span-2">
            <h2 className="text-xl font-semibold mb-4">Site Structure</h2>
            <div className="bg-white shadow overflow-hidden sm:rounded-lg p-4">
              {/* Implement tree view here */}
              <ul className="list-disc list-inside">
                {siteStructure.map((page) => (
                  <li key={page.page_id}>
                    <Link to={`/projects/${project_id}/content/${page.page_id}`} className="text-blue-600 hover:text-blue-800">
                      {page.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* SEO Health Score */}
          <div>
            <h2 className="text-xl font-semibold mb-4">SEO Health</h2>
            <div className="bg-white shadow overflow-hidden sm:rounded-lg p-4">
              <div className="text-4xl font-bold text-center mb-2">{currentProject?.seo_score || 0}</div>
              <p className="text-sm text-gray-500 text-center">Overall SEO Score</p>
              {/* Add more SEO metrics here */}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <ul className="divide-y divide-gray-200">
              {recentActivity.map((activity) => (
                <li key={activity.id} className="px-4 py-4 sm:px-6">
                  <p className="text-sm text-gray-500">
                    {new Date(activity.timestamp).toLocaleString()}: {activity.description}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Collaborators */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Collaborators</h2>
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <ul className="divide-y divide-gray-200">
              {collaborators.map((collaborator) => (
                <li key={collaborator.user_id} className="px-4 py-4 sm:px-6">
                  <p>{collaborator.name} ({collaborator.email}) - {collaborator.role}</p>
                </li>
              ))}
            </ul>
            {/* Invite Collaborator Form */}
            <div className="px-4 py-4 sm:px-6">
              <form onSubmit={(e) => {
                e.preventDefault();
                const email = (e.target as any).email.value;
                handleInviteCollaborator(email);
                (e.target as any).email.value = '';
              }}>
                <input
                  type="email"
                  name="email"
                  placeholder="Collaborator's email"
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  required
                />
                <button
                  type="submit"
                  className="mt-2 w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Invite Collaborator
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