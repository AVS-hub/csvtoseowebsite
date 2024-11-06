import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { RootState, AppDispatch, fetch_notifications } from '@/store/main';

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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRecentProjects();
    fetchActivityFeed();
    dispatch(fetch_notifications());
  }, [dispatch]);

  const fetchRecentProjects = async () => {
    setIsLoadingProjects(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:1337/api/projects', {
        headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` },
      });
      setRecentProjects(response.data.data);
      setProjectStats({
        total: response.data.data.length,
        inProgress: response.data.data.filter((project: any) => project.status === 'draft').length,
        completed: response.data.data.filter((project: any) => project.status === 'published').length,
      });
    } catch (err) {
      setError('Failed to fetch recent projects. Please try again later.');
    } finally {
      setIsLoadingProjects(false);
    }
  };

  const fetchActivityFeed = async () => {
    setIsLoadingActivity(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:1337/api/user/activity', {
        headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` },
      });
      setActivityFeed(response.data);
    } catch (err) {
      setError('Failed to fetch activity feed. Please try again later.');
    } finally {
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
        headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` },
      });
      setRecentProjects(recentProjects.filter(project => project.id !== projectId));
      setProjectStats(prevStats => ({
        ...prevStats,
        total: prevStats.total - 1,
        inProgress: prevStats.inProgress - 1, // Assuming deleted project was in progress
      }));
    } catch (err) {
      setError('Failed to delete project. Please try again later.');
    }
  };

  const ProjectCard: React.FC<{
    project: {
      id: string;
      name: string;
      description: string;
      lastModified: number;
      status: 'draft' | 'published';
      thumbnail: string;
    };
  }> = React.memo(({ project }) => (
    <div className="bg-white shadow-md rounded-lg p-4 mb-4">
      <img src={project.thumbnail || `https://picsum.photos/seed/${project.id}/300/200`} alt={project.name} className="w-full h-32 object-cover rounded mb-2" />
      <h3 className="text-lg font-semibold">{project.name}</h3>
      <p className="text-sm text-gray-600 mb-2">{project.description}</p>
      <p className="text-xs text-gray-500 mb-2">Last modified: {new Date(project.lastModified).toLocaleDateString()}</p>
      <div className="flex justify-between items-center">
        <span className={`text-xs px-2 py-1 rounded ${project.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
          {project.status}
        </span>
        <div>
          <button onClick={() => handleEditProject(project.id)} className="text-blue-600 hover:text-blue-800 mr-2">Edit</button>
          <button onClick={() => handlePreviewProject(project.id)} className="text-green-600 hover:text-green-800 mr-2">Preview</button>
          <button onClick={() => handleDeleteProject(project.id)} className="text-red-600 hover:text-red-800">Delete</button>
        </div>
      </div>
    </div>
  ));

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Welcome back, {userProfile.first_name}!</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-blue-100 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Total Projects</h2>
            <p className="text-3xl font-bold">{projectStats.total}</p>
          </div>
          <div className="bg-yellow-100 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">In Progress</h2>
            <p className="text-3xl font-bold">{projectStats.inProgress}</p>
          </div>
          <div className="bg-green-100 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Completed</h2>
            <p className="text-3xl font-bold">{projectStats.completed}</p>
          </div>
        </div>

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Recent Projects</h2>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentProjects.map(project => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}

        <h2 className="text-2xl font-semibold mt-8 mb-4">Activity Feed</h2>
        {isLoadingActivity ? (
          <p>Loading activity feed...</p>
        ) : (
          <ul className="bg-white shadow-md rounded-lg p-4">
            {activityFeed.map(activity => (
              <li key={activity.id} className="mb-2 pb-2 border-b border-gray-200 last:border-b-0">
                <p className="text-sm">{activity.description}</p>
                <p className="text-xs text-gray-500">{new Date(activity.timestamp).toLocaleString()}</p>
              </li>
            ))}
          </ul>
        )}

        <h2 className="text-2xl font-semibold mt-8 mb-4">Resources</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link to="/help" className="bg-white shadow-md rounded-lg p-4 hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-semibold mb-2">Tutorials</h3>
            <p className="text-sm text-gray-600">Learn how to use SiteGenie effectively</p>
          </Link>
          <a href="https://blog.sitegenie.com" target="_blank" rel="noopener noreferrer" className="bg-white shadow-md rounded-lg p-4 hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-semibold mb-2">Blog Posts</h3>
            <p className="text-sm text-gray-600">Stay updated with the latest features and tips</p>
          </a>
          <Link to="/help/documentation" className="bg-white shadow-md rounded-lg p-4 hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-semibold mb-2">Documentation</h3>
            <p className="text-sm text-gray-600">Detailed guides and API references</p>
          </Link>
        </div>
      </div>
    </>
  );
};

export default UV_Dashboard;