import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { RootState, AppDispatch, fetch_user_profile } from '@/store/main';

const UV_Dashboard: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const userProfile = useSelector((state: RootState) => state.user_profile);
  const notifications = useSelector((state: RootState) => state.notifications);

  const [recentProjects, setRecentProjects] = useState<any[]>([]);
  const [projectStats, setProjectStats] = useState({ total: 0, inProgress: 0, completed: 0 });
  const [activityFeed, setActivityFeed] = useState<any[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [isLoadingActivity, setIsLoadingActivity] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetch_user_profile());
    fetchRecentProjects();
    fetchActivityFeed();
  }, [dispatch]);

  const fetchRecentProjects = async () => {
    setIsLoadingProjects(true);
    try {
      const response = await axios.get('http://localhost:1337/api/projects', {
        headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
      });
      setRecentProjects(response.data.data);
      setProjectStats({
        total: response.data.data.length,
        inProgress: response.data.data.filter((p: any) => p.status === 'draft').length,
        completed: response.data.data.filter((p: any) => p.status === 'published').length,
      });
      setIsLoadingProjects(false);
    } catch (err) {
      setError('Failed to fetch recent projects. Please try again later.');
      setIsLoadingProjects(false);
    }
  };

  const fetchActivityFeed = async () => {
    setIsLoadingActivity(true);
    try {
      const response = await axios.get('http://localhost:1337/api/user/activity', {
        headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
      });
      setActivityFeed(response.data);
      setIsLoadingActivity(false);
    } catch (err) {
      setError('Failed to fetch activity feed. Please try again later.');
      setIsLoadingActivity(false);
    }
  };

  const handleCreateNewProject = () => {
    navigate('/projects/create');
  };

  const handleEditProject = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };

  const handlePreviewProject = (projectId: string) => {
    // Implement preview logic here
    console.log('Preview project:', projectId);
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      await axios.delete(`http://localhost:1337/api/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
      });
      fetchRecentProjects(); // Refresh the projects list
    } catch (err) {
      setError('Failed to delete project. Please try again later.');
    }
  };

  const openResourceLink = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Welcome back, {userProfile.first_name}!</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
            <p>{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-2">Total Projects</h2>
            <p className="text-3xl font-bold">{projectStats.total}</p>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-2">In Progress</h2>
            <p className="text-3xl font-bold">{projectStats.inProgress}</p>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-2">Completed</h2>
            <p className="text-3xl font-bold">{projectStats.completed}</p>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Recent Projects</h2>
            <button
              onClick={handleCreateNewProject}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
            >
              Create New Project
            </button>
          </div>
          {isLoadingProjects ? (
            <p>Loading projects...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentProjects.map((project) => (
                <div key={project.id} className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-xl font-semibold mb-2">{project.name}</h3>
                  <p className="text-gray-600 mb-4">{project.description}</p>
                  <div className="flex justify-between">
                    <button
                      onClick={() => handleEditProject(project.id)}
                      className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-2 rounded text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handlePreviewProject(project.id)}
                      className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-2 rounded text-sm"
                    >
                      Preview
                    </button>
                    <button
                      onClick={() => handleDeleteProject(project.id)}
                      className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-2 rounded text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-bold mb-4">Activity Feed</h2>
            {isLoadingActivity ? (
              <p>Loading activity...</p>
            ) : (
              <ul className="bg-white shadow rounded-lg divide-y divide-gray-200">
                {activityFeed.map((activity) => (
                  <li key={activity.id} className="p-4">
                    <p className="text-sm text-gray-600">{activity.description}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-4">Resources</h2>
            <ul className="bg-white shadow rounded-lg divide-y divide-gray-200">
              <li className="p-4 cursor-pointer hover:bg-gray-50" onClick={() => openResourceLink('https://sitegenie.com/tutorials')}>
                <p className="font-semibold">Tutorials</p>
                <p className="text-sm text-gray-600">Learn how to use SiteGenie effectively</p>
              </li>
              <li className="p-4 cursor-pointer hover:bg-gray-50" onClick={() => openResourceLink('https://sitegenie.com/blog')}>
                <p className="font-semibold">Blog Posts</p>
                <p className="text-sm text-gray-600">Stay updated with the latest features and tips</p>
              </li>
              <li className="p-4 cursor-pointer hover:bg-gray-50" onClick={() => openResourceLink('https://sitegenie.com/docs')}>
                <p className="font-semibold">Documentation</p>
                <p className="text-sm text-gray-600">Detailed guides and API reference</p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default UV_Dashboard;