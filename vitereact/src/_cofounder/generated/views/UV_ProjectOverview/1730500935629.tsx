import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch, set_current_project } from '@/store/main';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronRight, Settings, FileDown, Eye, Plus, Minus, Users } from 'lucide-react';

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
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold">Project Overview</h1>
              <p className="text-gray-600 mt-2">{currentProject?.name}</p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center space-x-4">
              <Badge variant="secondary">{currentProject?.type}</Badge>
              <p className="text-sm text-gray-500">Created: {new Date(currentProject?.created_at ?? 0).toLocaleDateString()}</p>
              <p className="text-sm text-gray-500">Last Modified: {new Date(currentProject?.updated_at ?? 0).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm font-medium">{currentProject?.progress}%</span>
            </div>
            <Progress value={currentProject?.progress} className="w-full" />
          </div>

          <div className="flex flex-wrap gap-4">
            <Button onClick={handleGenerateContent}>
              <ChevronRight className="mr-2 h-4 w-4" /> Generate Content
            </Button>
            <Button variant="outline">
              <Eye className="mr-2 h-4 w-4" /> Preview Website
            </Button>
            <Button variant="outline" onClick={handleExportWebsite}>
              <FileDown className="mr-2 h-4 w-4" /> Export
            </Button>
            <Button variant="outline">
              <Settings className="mr-2 h-4 w-4" /> Project Settings
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Site Structure</h2>
            <ul className="space-y-2 mb-4">
              {siteStructure.map((page) => (
                <li key={page.page_id}>
                  <Link to={`/projects/${project_id}/content/${page.page_id}`} className="text-blue-500 hover:underline">
                    {page.title}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="flex space-x-4">
              <Button variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" /> Add Page
              </Button>
              <Button variant="outline" size="sm">
                <Minus className="mr-2 h-4 w-4" /> Remove Page
              </Button>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-white shadow-md rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4">SEO Health</h2>
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-3xl font-bold text-green-600">{currentProject?.seo_score}</span>
                </div>
                <div>
                  <p className="text-lg font-semibold">SEO Score</p>
                  <Link to={`/projects/${project_id}/seo`} className="text-blue-500 hover:underline">
                    View Detailed Analysis
                  </Link>
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Metric</TableHead>
                    <TableHead>Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Page Speed</TableCell>
                    <TableCell>Fast</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Backlinks</TableCell>
                    <TableCell>23</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Keywords</TableCell>
                    <TableCell>15</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            <div className="bg-white shadow-md rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
              <ul className="space-y-4 max-h-60 overflow-y-auto">
                {recentActivity.map((activity) => (
                  <li key={activity.id} className="border-b pb-2">
                    <p className="text-sm">{activity.description}</p>
                    <p className="text-xs text-gray-400">{new Date(activity.timestamp).toLocaleString()}</p>
                  </li>
                ))}
              </ul>
              <Button variant="link" className="mt-4">View All Activity</Button>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6 mt-8">
          <h2 className="text-2xl font-bold mb-4">Collaborators</h2>
          <div className="flex flex-wrap gap-4 mb-4">
            {collaborators.map((collaborator) => (
              <div key={collaborator.user_id} className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <Users className="h-4 w-4 text-gray-500" />
                </div>
                <div>
                  <p className="font-medium">{collaborator.name}</p>
                  <p className="text-sm text-gray-500">{collaborator.email}</p>
                </div>
              </div>
            ))}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const email = (e.target as HTMLFormElement).email.value;
              handleInviteCollaborator(email);
              (e.target as HTMLFormElement).reset();
            }}
            className="flex space-x-2"
          >
            <input
              type="email"
              name="email"
              placeholder="Enter email to invite"
              className="flex-grow px-3 py-2 border rounded-md"
              required
            />
            <Button type="submit">Invite</Button>
          </form>
        </div>
      </div>
    </>
  );
};

export default UV_ProjectOverview;