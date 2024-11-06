import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { RootState, AppDispatch, fetch_notifications } from '@/store/main';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, FolderIcon, PenIcon, PlayIcon, TrashIcon, PlusIcon, LayersIcon, Clock4Icon, CheckCircleIcon } from "lucide-react";

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
        inProgress: prevStats.inProgress - 1,
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
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <img src={project.thumbnail || `https://picsum.photos/seed/${project.id}/300/200`} alt={project.name} className="w-full h-32 object-cover" />
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">{project.name}</h3>
        <p className="text-sm text-gray-600 mb-2">{project.description}</p>
        <p className="text-xs text-gray-500 mb-2">Last modified: {new Date(project.lastModified).toLocaleDateString()}</p>
        <div className="flex justify-between items-center">
          <Badge variant={project.status === 'published' ? "success" : "warning"}>
            {project.status}
          </Badge>
          <div className="flex space-x-2">
            <Button variant="outline" size="icon" onClick={() => handleEditProject(project.id)}>
              <PenIcon className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => handlePreviewProject(project.id)}>
              <PlayIcon className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => handleDeleteProject(project.id)}>
              <TrashIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  ));

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-gray-600">Welcome back, {userProfile.first_name}!</p>
          </div>
          <Button onClick={handleCreateNewProject}>
            <PlusIcon className="mr-2 h-4 w-4" /> Create New Project
          </Button>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <FolderIcon className="h-8 w-8 text-blue-500 mr-4" />
              <div>
                <h2 className="text-xl font-semibold mb-1">Total Projects</h2>
                <p className="text-3xl font-bold">{projectStats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <Clock4Icon className="h-8 w-8 text-yellow-500 mr-4" />
              <div>
                <h2 className="text-xl font-semibold mb-1">In Progress</h2>
                <p className="text-3xl font-bold">{projectStats.inProgress}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <CheckCircleIcon className="h-8 w-8 text-green-500 mr-4" />
              <div>
                <h2 className="text-xl font-semibold mb-1">Completed</h2>
                <p className="text-3xl font-bold">{projectStats.completed}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3">
            <h2 className="text-2xl font-semibold mb-4">Recent Projects</h2>
            {isLoadingProjects ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentProjects.map(project => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            )}
          </div>

          <div className="lg:w-1/3">
            <h2 className="text-2xl font-semibold mb-4">Activity Feed</h2>
            {isLoadingActivity ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <div className="bg-white shadow-md rounded-lg p-4">
                {activityFeed.map(activity => (
                  <div key={activity.id} className="mb-4 pb-4 border-b border-gray-200 last:border-b-0">
                    <div className="flex items-start">
                      <LayersIcon className="h-5 w-5 text-blue-500 mr-2 mt-1" />
                      <div>
                        <p className="text-sm">{activity.description}</p>
                        <p className="text-xs text-gray-500">{new Date(activity.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <h2 className="text-2xl font-semibold mt-8 mb-4">Resources</h2>
            <div className="bg-white shadow-md rounded-lg p-4">
              <Link to="/help" className="block mb-4 hover:bg-gray-50 p-2 rounded transition-colors">
                <h3 className="text-lg font-semibold mb-1">Tutorials</h3>
                <p className="text-sm text-gray-600">Learn how to use SiteGenie effectively</p>
              </Link>
              <a href="https://blog.sitegenie.com" target="_blank" rel="noopener noreferrer" className="block mb-4 hover:bg-gray-50 p-2 rounded transition-colors">
                <h3 className="text-lg font-semibold mb-1">Blog Posts</h3>
                <p className="text-sm text-gray-600">Stay updated with the latest features and tips</p>
              </a>
              <Link to="/help/documentation" className="block hover:bg-gray-50 p-2 rounded transition-colors">
                <h3 className="text-lg font-semibold mb-1">Documentation</h3>
                <p className="text-sm text-gray-600">Detailed guides and API references</p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UV_Dashboard;