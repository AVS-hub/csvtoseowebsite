import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch, fetch_user_profile } from '@/store/main';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Plus, Edit2, Eye, Trash2, ChevronRight } from "lucide-react";

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
      <div className="flex h-screen bg-gray-100">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-md">
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">SiteGenie</h2>
            <div className="mb-6">
              <img
                src={`https://picsum.photos/seed/${userProfile.id}/200`}
                alt="Profile"
                className="w-20 h-20 rounded-full mx-auto mb-2"
              />
              <p className="text-center font-semibold">
                {userProfile.first_name} {userProfile.last_name}
              </p>
            </div>
            <nav>
              <Link to="/dashboard" className="block py-2 px-4 text-blue-600 bg-blue-100 rounded">
                Dashboard
              </Link>
              <Link to="/projects" className="block py-2 px-4 text-gray-700 hover:bg-gray-100 rounded mt-2">
                Projects
              </Link>
              <Link to="/settings" className="block py-2 px-4 text-gray-700 hover:bg-gray-100 rounded mt-2">
                Settings
              </Link>
            </nav>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-6 py-8">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold">
                Welcome back, {userProfile.first_name || 'User'}!
              </h1>
              <Button onClick={createNewProject} variant="default">
                <Plus className="mr-2 h-4 w-4" /> Create New Project
              </Button>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6 transform hover:scale-105 transition-transform duration-200">
                <h2 className="text-xl font-semibold mb-2 text-gray-700">Total Projects</h2>
                <p className="text-3xl font-bold text-blue-600">{projectStats.total}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6 transform hover:scale-105 transition-transform duration-200">
                <h2 className="text-xl font-semibold mb-2 text-gray-700">In Progress</h2>
                <p className="text-3xl font-bold text-yellow-600">{projectStats.inProgress}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6 transform hover:scale-105 transition-transform duration-200">
                <h2 className="text-xl font-semibold mb-2 text-gray-700">Completed</h2>
                <p className="text-3xl font-bold text-green-600">{projectStats.completed}</p>
              </div>
            </div>

            {/* Recent Projects */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Recent Projects</h2>
              {isLoadingProjects ? (
                <p className="text-gray-600">Loading projects...</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recentProjects.map((project) => (
                    <div key={project.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                      <div className="p-6">
                        <h3 className="text-xl font-semibold mb-2">{project.name}</h3>
                        <p className="text-gray-600 mb-4">{project.description}</p>
                      </div>
                      <div className="bg-gray-50 px-6 py-4">
                        <div className="flex justify-between">
                          <Button onClick={() => editProject(project.id)} variant="outline" size="sm">
                            <Edit2 className="mr-2 h-4 w-4" /> Edit
                          </Button>
                          <Button onClick={() => previewProject(project.id)} variant="outline" size="sm">
                            <Eye className="mr-2 h-4 w-4" /> Preview
                          </Button>
                          <Button onClick={() => deleteProject(project.id)} variant="outline" size="sm">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Activity Feed */}
              <div>
                <h2 className="text-2xl font-bold mb-4">Activity Feed</h2>
                {isLoadingActivity ? (
                  <p className="text-gray-600">Loading activity...</p>
                ) : (
                  <ul className="bg-white rounded-lg shadow-md divide-y divide-gray-200">
                    {activityFeed.map((activity) => (
                      <li key={activity.id} className="p-4 hover:bg-gray-50 transition-colors duration-150">
                        <p className="font-semibold text-gray-800">{activity.description}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {new Date(activity.timestamp).toLocaleString()}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Resources */}
              <div>
                <h2 className="text-2xl font-bold mb-4">Helpful Resources</h2>
                <ul className="bg-white rounded-lg shadow-md divide-y divide-gray-200">
                  {[
                    { title: "Getting Started Guide", url: "https://docs.sitegenie.com/getting-started" },
                    { title: "Video Tutorials", url: "https://docs.sitegenie.com/tutorials" },
                    { title: "API Documentation", url: "https://docs.sitegenie.com/api" },
                  ].map((resource, index) => (
                    <li key={index} className="p-4 hover:bg-gray-50 transition-colors duration-150">
                      <a
                        href="#"
                        onClick={() => openResourceLink(resource.url)}
                        className="flex justify-between items-center text-blue-600 hover:text-blue-800"
                      >
                        <span>{resource.title}</span>
                        <ChevronRight className="h-5 w-5" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UV_Dashboard;