import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { RootState, AppDispatch, fetch_user_profile } from '@/store/main';
import axios from 'axios';

const UV_Dashboard: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const userProfile = useSelector((state: RootState) => state.user_profile);
  const notifications = useSelector((state: RootState) => state.notifications);

  const [recentProjects, setRecentProjects] = useState<Array<{
    id: string;
    name: string;
    description: string;
    lastModified: number;
    status: 'draft' | 'published';
    thumbnail: string;
  }>>([]);
  const [projectStats, setProjectStats] = useState({
    total: 0,
    inProgress: 0,
    completed: 0,
  });
  const [activityFeed, setActivityFeed] = useState<Array<{
    id: string;
    type: string;
    description: string;
    timestamp: number;
  }>>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [isLoadingActivity, setIsLoadingActivity] = useState(true);

  useEffect(() => {
    dispatch(fetch_user_profile());
    fetchRecentProjects();
    fetchActivityFeed();
  }, [dispatch]);

  const fetchRecentProjects = async () => {
    setIsLoadingProjects(true);
    try {
      const response = await axios.get('http://localhost:1337/api/projects?limit=5');
      setRecentProjects(response.data.data);
      setProjectStats({
        total: response.data.total,
        inProgress: response.data.inProgress,
        completed: response.data.completed,
      });
    } catch (error) {
      console.error('Error fetching recent projects:', error);
    }
    setIsLoadingProjects(false);
  };

  const fetchActivityFeed = async () => {
    setIsLoadingActivity(true);
    try {
      const response = await axios.get('http://localhost:1337/api/activity');
      setActivityFeed(response.data);
    } catch (error) {
      console.error('Error fetching activity feed:', error);
    }
    setIsLoadingActivity(false);
  };

  const createNewProject = () => {
    navigate('/projects/create');
  };

  const editProject = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };

  const previewProject = (projectId: string) => {
    window.open(`/preview/${projectId}`, '_blank');
  };

  const deleteProject = async (projectId: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await axios.delete(`http://localhost:1337/api/projects/${projectId}`);
        fetchRecentProjects();
      } catch (error) {
        console.error('Error deleting project:', error);
      }
    }
  };

  const openResourceLink = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">
          Welcome back, {userProfile.first_name}!
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-2">Total Projects</h2>
            <p className="text-4xl font-bold text-blue-600">{projectStats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-2">In Progress</h2>
            <p className="text-4xl font-bold text-yellow-600">{projectStats.inProgress}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-2">Completed</h2>
            <p className="text-4xl font-bold text-green-600">{projectStats.completed}</p>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Recent Projects</h2>
            <button
              onClick={createNewProject}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Create New Project
            </button>
          </div>
          {isLoadingProjects ? (
            <div className="text-center">Loading projects...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentProjects.map((project) => (
                <div key={project.id} className="bg-white rounded-lg shadow p-6">
                  <img
                    src={project.thumbnail || `https://picsum.photos/seed/${project.id}/300/200`}
                    alt={project.name}
                    className="w-full h-40 object-cover rounded mb-4"
                  />
                  <h3 className="text-xl font-semibold mb-2">{project.name}</h3>
                  <p className="text-gray-600 mb-4">{project.description}</p>
                  <div className="flex justify-between items-center">
                    <span className={`px-2 py-1 rounded text-sm ${
                      project.status === 'published' ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'
                    }`}>
                      {project.status}
                    </span>
                    <div>
                      <button
                        onClick={() => editProject(project.id)}
                        className="text-blue-600 hover:text-blue-800 mr-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => previewProject(project.id)}
                        className="text-green-600 hover:text-green-800 mr-2"
                      >
                        Preview
                      </button>
                      <button
                        onClick={() => deleteProject(project.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </div>
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
              <div className="text-center">Loading activity...</div>
            ) : (
              <ul className="bg-white rounded-lg shadow divide-y">
                {activityFeed.map((activity) => (
                  <li key={activity.id} className="p-4">
                    <p className="font-semibold">{activity.description}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-4">Resources</h2>
            <ul className="bg-white rounded-lg shadow divide-y">
              <li className="p-4">
                <a
                  href="#"
                  onClick={() => openResourceLink('https://example.com/getting-started')}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Getting Started Guide
                </a>
              </li>
              <li className="p-4">
                <a
                  href="#"
                  onClick={() => openResourceLink('https://example.com/tutorials')}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Video Tutorials
                </a>
              </li>
              <li className="p-4">
                <a
                  href="#"
                  onClick={() => openResourceLink('https://example.com/blog')}
                  className="text-blue-600 hover:text-blue-800"
                >
                  SiteGenie Blog
                </a>
              </li>
              <li className="p-4">
                <a
                  href="#"
                  onClick={() => openResourceLink('https://example.com/documentation')}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Documentation
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default UV_Dashboard;