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

  const [siteStructure, setSiteStructure] = useState<Array<any>>([]);
  const [recentActivity, setRecentActivity] = useState<Array<any>>([]);
  const [collaborators, setCollaborators] = useState<Array<any>>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjectDetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:1337/api/projects/${project_id}`, {
        headers: { Authorization: `Bearer ${userAuth.token}` },
      });
      dispatch(set_current_project(response.data));
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch project details');
      setLoading(false);
    }
  }, [project_id, userAuth.token, dispatch]);

  const fetchSiteStructure = useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost:1337/api/projects/${project_id}/structure`, {
        headers: { Authorization: `Bearer ${userAuth.token}` },
      });
      setSiteStructure(response.data);
    } catch (err) {
      setError('Failed to fetch site structure');
    }
  }, [project_id, userAuth.token]);

  const fetchRecentActivity = useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost:1337/api/projects/${project_id}/activity`, {
        headers: { Authorization: `Bearer ${userAuth.token}` },
      });
      setRecentActivity(response.data);
    } catch (err) {
      setError('Failed to fetch recent activity');
    }
  }, [project_id, userAuth.token]);

  const fetchCollaborators = useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost:1337/api/projects/${project_id}/collaborators`, {
        headers: { Authorization: `Bearer ${userAuth.token}` },
      });
      setCollaborators(response.data);
    } catch (err) {
      setError('Failed to fetch collaborators');
    }
  }, [project_id, userAuth.token]);

  useEffect(() => {
    fetchProjectDetails();
    fetchSiteStructure();
    fetchRecentActivity();
    fetchCollaborators();
  }, [fetchProjectDetails, fetchSiteStructure, fetchRecentActivity, fetchCollaborators]);

  const handleGenerateContent = async () => {
    try {
      await axios.post(`http://localhost:1337/api/projects/${project_id}/generate-content`, {}, {
        headers: { Authorization: `Bearer ${userAuth.token}` },
      });
      // Refresh project details after content generation
      fetchProjectDetails();
    } catch (err) {
      setError('Failed to generate content');
    }
  };

  const handleExportWebsite = async () => {
    try {
      const response = await axios.post(`http://localhost:1337/api/projects/${project_id}/export`, {}, {
        headers: { Authorization: `Bearer ${userAuth.token}` },
      });
      // Handle the export response, e.g., provide a download link
      console.log('Export initiated:', response.data);
    } catch (err) {
      setError('Failed to export website');
    }
  };

  const handleInviteCollaborator = async (email: string) => {
    try {
      await axios.post(`http://localhost:1337/api/projects/${project_id}/collaborators`, { email }, {
        headers: { Authorization: `Bearer ${userAuth.token}` },
      });
      fetchCollaborators();
    } catch (err) {
      setError('Failed to invite collaborator');
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
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <h1 className="text-3xl font-bold mb-4">{currentProject?.name}</h1>
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-gray-600">Type: {currentProject?.type}</p>
              <p className="text-gray-600">Created: {new Date(currentProject?.created_at ?? 0).toLocaleDateString()}</p>
              <p className="text-gray-600">Last Modified: {new Date(currentProject?.updated_at ?? 0).toLocaleDateString()}</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={handleGenerateContent}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
              >
                Generate Content
              </button>
              <button
                onClick={handleExportWebsite}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
              >
                Export Website
              </button>
              <Link
                to={`/projects/${project_id}/design`}
                className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded"
              >
                Customize Design
              </Link>
            </div>
          </div>
          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2">Progress</h2>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${currentProject?.progress ?? 0}%` }}
              ></div>
            </div>
            <p className="text-right text-sm text-gray-600">{currentProject?.progress}% Complete</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Site Structure</h2>
            <ul className="list-disc list-inside">
              {siteStructure.map((page) => (
                <li key={page.page_id} className="mb-2">
                  <Link to={`/projects/${project_id}/content/${page.page_id}`} className="text-blue-500 hover:underline">
                    {page.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">SEO Health Score</h2>
            <div className="text-center">
              <div className="inline-block rounded-full bg-green-100 p-4">
                <span className="text-4xl font-bold text-green-600">{currentProject?.seo_score}</span>
              </div>
            </div>
            <p className="text-center mt-2 text-gray-600">Overall SEO Score</p>
            <Link
              to={`/projects/${project_id}/seo`}
              className="block mt-4 text-center text-blue-500 hover:underline"
            >
              View Detailed SEO Analysis
            </Link>
          </div>

          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
            <ul className="divide-y divide-gray-200">
              {recentActivity.map((activity) => (
                <li key={activity.id} className="py-2">
                  <p className="text-sm text-gray-600">{activity.description}</p>
                  <p className="text-xs text-gray-400">{new Date(activity.timestamp).toLocaleString()}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Collaborators</h2>
            <ul className="divide-y divide-gray-200">
              {collaborators.map((collaborator) => (
                <li key={collaborator.user_id} className="py-2">
                  <p>{collaborator.name}</p>
                  <p className="text-sm text-gray-600">{collaborator.email}</p>
                </li>
              ))}
            </ul>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const email = (e.target as HTMLFormElement).email.value;
                handleInviteCollaborator(email);
                (e.target as HTMLFormElement).reset();
              }}
              className="mt-4"
            >
              <input
                type="email"
                name="email"
                placeholder="Enter email to invite"
                className="w-full px-3 py-2 border rounded-md"
                required
              />
              <button
                type="submit"
                className="mt-2 w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
              >
                Invite Collaborator
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default UV_ProjectOverview;