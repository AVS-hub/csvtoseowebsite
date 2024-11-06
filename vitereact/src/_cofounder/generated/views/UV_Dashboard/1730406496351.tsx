import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { RootState, AppDispatch, fetch_user_profile, fetch_notifications } from '@/store/main';
import axios from 'axios';

const UV_Dashboard: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
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
    dispatch(fetch_notifications());
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
        inProgress: response.data.data.filter((project: any) => project.status === 'draft').length,
        completed: response.data.data.filter((project: any) => project.status === 'published').length,
      });
    } catch (error) {
      console.error('Error fetching recent projects:', error);
    }
    setIsLoadingProjects(false);
  };

  const fetchActivityFeed = async () => {
    setIsLoadingActivity(true);
    try {
      const response = await axios.get('http://localhost:1337/api/user-activity');
      setActivityFeed(response.data);
    } catch (error) {
      console.error('Error fetching activity feed:', error);
    }
    setIsLoadingActivity(false);
  };

  const deleteProject = async (projectId: string) => {
    try {
      await axios.delete(`http://localhost:1337/api/projects/${projectId}`);
      fetchRecentProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Welcome back, {userProfile.first_name}!</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-2">Total Projects</h2>
            <p className="text-4xl font-bold">{projectStats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-2">In Progress</h2>
            <p className="text-4xl font-bold">{projectStats.inProgress}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-2">Completed</h2>
            <p className="text-4xl font-bold">{projectStats.completed}</p>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Recent Projects</h2>
            <Link to="/projects/create" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
              Create New Project
            </Link>
          </div>
          {isLoadingProjects ? (
            <div className="animate-pulse flex space-x-4">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="bg-gray-200 h-48 w-64 rounded"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentProjects.map((project) => (
                <div key={project.id} className="bg-white rounded-lg shadow overflow-hidden">
                  <img src={project.thumbnail || `https://picsum.photos/seed/${project.id}/300/200`} alt={project.name} className="w-full h-40 object-cover" />
                  <div className="p-4">
                    <h3 className="text-xl font-semibold mb-2">{project.name}</h3>
                    <p className="text-gray-600 mb-4">{project.description}</p>
                    <div className="flex justify-between items-center">
                      <span className={`px-2 py-1 rounded text-sm ${project.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {project.status}
                      </span>
                      <div className="space-x-2">
                        <Link to={`/projects/${project.id}`} className="text-blue-500 hover:text-blue-600">Edit</Link>
                        <button onClick={() => window.open(`/preview/${project.id}`, '_blank')} className="text-green-500 hover:text-green-600">Preview</button>
                        <button onClick={() => deleteProject(project.id)} className="text-red-500 hover:text-red-600">Delete</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <h2 className="text-2xl font-bold mb-4">Activity Feed</h2>
            {isLoadingActivity ? (
              <div className="animate-pulse space-y-4">
                {[...Array(5)].map((_, index) => (
                  <div key={index} className="bg-gray-200 h-12 rounded"></div>
                ))}
              </div>
            ) : (
              <ul className="space-y-4">
                {activityFeed.map((activity) => (
                  <li key={activity.id} className="bg-white rounded-lg shadow p-4">
                    <p className="font-semibold">{activity.description}</p>
                    <p className="text-sm text-gray-500">{new Date(activity.timestamp).toLocaleString()}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-4">Resources</h2>
            <ul className="bg-white rounded-lg shadow p-4 space-y-2">
              <li><a href="/help/getting-started" className="text-blue-500 hover:text-blue-600">Getting Started Guide</a></li>
              <li><a href="/blog/seo-tips" className="text-blue-500 hover:text-blue-600">SEO Tips for Your Website</a></li>
              <li><a href="/docs/api-reference" className="text-blue-500 hover:text-blue-600">API Documentation</a></li>
              <li><a href="/tutorials/advanced-customization" className="text-blue-500 hover:text-blue-600">Advanced Customization Tutorial</a></li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default UV_Dashboard;