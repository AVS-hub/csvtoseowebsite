import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch, fetch_user_profile } from '@/store/main';
import axios from 'axios';

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

  useEffect(() => {
    dispatch(fetch_user_profile());
    fetchRecentProjects();
    fetchActivityFeed();
  }, [dispatch]);

  const fetchRecentProjects = async () => {
    setIsLoadingProjects(true);
    try {
      const response = await axios.get('http://localhost:1337/api/projects');
      setRecentProjects(response.data.data);
      setProjectStats({
        total: response.data.data.length,
        inProgress: response.data.data.filter((p: any) => p.status === 'draft').length,
        completed: response.data.data.filter((p: any) => p.status === 'published').length,
      });
    } catch (error) {
      console.error('Error fetching recent projects:', error);
    }
    setIsLoadingProjects(false);
  };

  const fetchActivityFeed = async () => {
    setIsLoadingActivity(true);
    try {
      const response = await axios.get('http://localhost:1337/api/users/me/activities');
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
    // Implement project preview logic
    console.log('Preview project:', projectId);
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
          Welcome back, {userProfile.first_name || 'User'}!
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-2">Total Projects</h2>
            <p className="text-3xl font-bold">{projectStats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-2">In Progress</h2>
            <p className="text-3xl font-bold">{projectStats.inProgress}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-2">Completed</h2>
            <p className="text-3xl font-bold">{projectStats.completed}</p>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Recent Projects</h2>
            <button
              onClick={createNewProject}
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
                <div key={project.id} className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-xl font-semibold mb-2">{project.name}</h3>
                  <p className="text-gray-600 mb-4">{project.description}</p>
                  <div className="flex justify-between">
                    <button
                      onClick={() => editProject(project.id)}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => previewProject(project.id)}
                      className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
                    >
                      Preview
                    </button>
                    <button
                      onClick={() => deleteProject(project.id)}
                      className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
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
                  onClick={() => openResourceLink('https://docs.sitegenie.com/getting-started')}
                  className="text-blue-500 hover:text-blue-600"
                >
                  Getting Started Guide
                </a>
              </li>
              <li className="p-4">
                <a
                  href="#"
                  onClick={() => openResourceLink('https://docs.sitegenie.com/tutorials')}
                  className="text-blue-500 hover:text-blue-600"
                >
                  Video Tutorials
                </a>
              </li>
              <li className="p-4">
                <a
                  href="#"
                  onClick={() => openResourceLink('https://docs.sitegenie.com/api')}
                  className="text-blue-500 hover:text-blue-600"
                >
                  API Documentation
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