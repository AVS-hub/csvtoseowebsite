import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch, fetch_notifications } from '@/store/main';
import axios from 'axios';

const ProjectCard: React.FC<{
  project: {
    id: string;
    name: string;
    description: string;
    lastModified: number;
    status: 'draft' | 'published';
    thumbnail: string;
  };
  onEdit: (id: string) => void;
  onPreview: (id: string) => void;
  onDelete: (id: string) => void;
}> = React.memo(({ project, onEdit, onPreview, onDelete }) => (
  <div className="bg-white shadow-md rounded-lg p-4 mb-4">
    <img src={project.thumbnail || `https://picsum.photos/seed/${project.id}/200/100`} alt={project.name} className="w-full h-32 object-cover rounded-md mb-2" />
    <h3 className="text-lg font-semibold mb-1">{project.name}</h3>
    <p className="text-sm text-gray-600 mb-2">{project.description}</p>
    <div className="flex justify-between items-center">
      <span className={`text-sm ${project.status === 'published' ? 'text-green-600' : 'text-yellow-600'}`}>
        {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
      </span>
      <div className="space-x-2">
        <button onClick={() => onEdit(project.id)} className="text-blue-600 hover:text-blue-800">Edit</button>
        <button onClick={() => onPreview(project.id)} className="text-green-600 hover:text-green-800">Preview</button>
        <button onClick={() => onDelete(project.id)} className="text-red-600 hover:text-red-800">Delete</button>
      </div>
    </div>
  </div>
));

const ActivityItem: React.FC<{
  activity: {
    id: string;
    type: string;
    description: string;
    timestamp: number;
  };
}> = React.memo(({ activity }) => (
  <li className="mb-2">
    <span className="font-semibold">{activity.type}: </span>
    {activity.description}
    <span className="text-sm text-gray-500 ml-2">
      {new Date(activity.timestamp).toLocaleString()}
    </span>
  </li>
));

const UV_Dashboard: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const userProfile = useSelector((state: RootState) => state.user_profile);
  const notifications = useSelector((state: RootState) => state.notifications);

  const [recentProjects, setRecentProjects] = useState<Array<any>>([]);
  const [projectStats, setProjectStats] = useState({ total: 0, inProgress: 0, completed: 0 });
  const [activityFeed, setActivityFeed] = useState<Array<any>>([]);
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
      const response = await axios.get('http://localhost:1337/api/projects');
      setRecentProjects(response.data.data);
      setProjectStats({
        total: response.data.data.length,
        inProgress: response.data.data.filter((p: any) => p.status === 'draft').length,
        completed: response.data.data.filter((p: any) => p.status === 'published').length,
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
      const response = await axios.get('http://localhost:1337/api/user-activities');
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
    // Implement preview logic (e.g., open in a new tab)
    window.open(`/projects/${projectId}/preview`, '_blank');
  };

  const handleDeleteProject = async (projectId: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await axios.delete(`http://localhost:1337/api/projects/${projectId}`);
        setRecentProjects(recentProjects.filter(project => project.id !== projectId));
        setProjectStats(prevStats => ({
          ...prevStats,
          total: prevStats.total - 1,
          inProgress: prevStats.inProgress - (recentProjects.find(p => p.id === projectId)?.status === 'draft' ? 1 : 0),
          completed: prevStats.completed - (recentProjects.find(p => p.id === projectId)?.status === 'published' ? 1 : 0),
        }));
      } catch (err) {
        setError('Failed to delete the project. Please try again later.');
      }
    }
  };

  const handleOpenResourceLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Welcome, {userProfile.first_name || 'User'}!</h1>
        
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="bg-gray-200 h-64 rounded-lg animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {recentProjects.map(project => (
              <ProjectCard
                key={project.id}
                project={project}
                onEdit={handleEditProject}
                onPreview={handlePreviewProject}
                onDelete={handleDeleteProject}
              />
            ))}
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-2/3">
            <h2 className="text-2xl font-semibold mb-4">Activity Feed</h2>
            {isLoadingActivity ? (
              <div className="bg-gray-200 h-64 rounded-lg animate-pulse"></div>
            ) : (
              <ul className="bg-white shadow-md rounded-lg p-4">
                {activityFeed.map(activity => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))}
              </ul>
            )}
          </div>
          <div className="w-full md:w-1/3">
            <h2 className="text-2xl font-semibold mb-4">Resources</h2>
            <ul className="bg-white shadow-md rounded-lg p-4">
              <li className="mb-2">
                <button
                  onClick={() => handleOpenResourceLink('https://example.com/tutorial')}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Getting Started Tutorial
                </button>
              </li>
              <li className="mb-2">
                <button
                  onClick={() => handleOpenResourceLink('https://example.com/blog')}
                  className="text-blue-600 hover:text-blue-800"
                >
                  SiteGenie Blog
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleOpenResourceLink('https://example.com/docs')}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Documentation
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default UV_Dashboard;