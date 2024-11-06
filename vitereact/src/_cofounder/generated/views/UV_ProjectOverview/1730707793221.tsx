import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch, set_current_project } from '@/store/main';
import axios from 'axios';
import { TreeView, TreeItem } from '@mui/lab';
import { ExpandMore, ChevronRight } from '@mui/icons-material';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { FileText, Eye, Download, Settings, Plus, Minus, Users } from "lucide-react";

const UV_ProjectOverview: React.FC = () => {
  const { project_id } = useParams<{ project_id: string }>();
  const dispatch: AppDispatch = useDispatch();
  const projectDetails = useSelector((state: RootState) => state.current_project);
  const userAuth = useSelector((state: RootState) => state.user_auth);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [siteStructure, setSiteStructure] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [collaborators, setCollaborators] = useState<any[]>([]);
  const [progress, setProgress] = useState(0);
  const [seoScore, setSeoScore] = useState(0);

  const fetchProjectData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await dispatch(set_current_project(project_id as string));
      const [structureRes, activityRes, collaboratorsRes] = await Promise.all([
        axios.get(`http://localhost:1337/api/projects/${project_id}/structure`),
        axios.get(`http://localhost:1337/api/projects/${project_id}/activity`),
        axios.get(`http://localhost:1337/api/projects/${project_id}/collaborators`)
      ]);
      setSiteStructure(structureRes.data);
      setRecentActivity(activityRes.data);
      setCollaborators(collaboratorsRes.data);
    } catch (err) {
      setError('Failed to fetch project data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [dispatch, project_id]);

  useEffect(() => {
    fetchProjectData();
  }, [fetchProjectData]);

  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:1337/ws/projects/${project_id}`);
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'progress') setProgress(data.value);
      if (data.type === 'seo_score') setSeoScore(data.value);
    };
    return () => ws.close();
  }, [project_id]);

  const handleGenerateContent = async () => {
    try {
      await axios.post(`http://localhost:1337/api/projects/${project_id}/generate-content`);
      // Handle success (e.g., show a success message)
    } catch (err) {
      setError('Failed to generate content. Please try again.');
    }
  };

  const handleExportWebsite = async () => {
    try {
      const res = await axios.post(`http://localhost:1337/api/projects/${project_id}/export`);
      window.location.href = res.data.download_url;
    } catch (err) {
      setError('Failed to export website. Please try again.');
    }
  };

  const handleInviteCollaborator = async (email: string) => {
    try {
      await axios.post(`http://localhost:1337/api/projects/${project_id}/collaborators`, { email });
      fetchProjectData(); // Refresh collaborators list
    } catch (err) {
      setError('Failed to invite collaborator. Please try again.');
    }
  };

  const renderSiteStructure = (nodes: any[]) => (
    <TreeView
      defaultCollapseIcon={<ExpandMore />}
      defaultExpandIcon={<ChevronRight />}
    >
      {nodes.map((node) => (
        <TreeItem key={node.page_id} nodeId={node.page_id} label={node.title}>
          {node.children && node.children.length > 0 && renderSiteStructure(node.children)}
        </TreeItem>
      ))}
    </TreeView>
  );

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (error) return <div className="text-red-500 text-center">{error}</div>;
  if (!projectDetails) return <div className="text-center">Project not found</div>;

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{projectDetails.name}</h1>
                <Badge className="mt-2">{projectDetails.type}</Badge>
              </div>
            </div>
            <div className="flex flex-wrap text-sm text-gray-500 mb-6">
              <p className="mr-4">Created on: {new Date(projectDetails.created_at!).toLocaleDateString()}</p>
              <p>Last modified: {new Date(projectDetails.updated_at!).toLocaleDateString()}</p>
            </div>

            <div className="mb-8">
              <Label htmlFor="progress" className="text-sm font-medium text-gray-700">Overall Progress</Label>
              <div className="flex items-center mt-2">
                <Progress id="progress" value={progress} className="flex-grow" />
                <span className="ml-4 text-sm font-medium text-gray-700">{progress}%</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 mb-8">
              <Button onClick={handleGenerateContent} className="flex items-center">
                <FileText className="mr-2 h-4 w-4" /> Generate Content
              </Button>
              <Link to={`/projects/${project_id}/preview`}>
                <Button variant="secondary" className="flex items-center">
                  <Eye className="mr-2 h-4 w-4" /> Preview Website
                </Button>
              </Link>
              <Button onClick={handleExportWebsite} variant="outline" className="flex items-center">
                <Download className="mr-2 h-4 w-4" /> Export
              </Button>
              <Link to={`/projects/${project_id}/settings`}>
                <Button variant="outline" className="flex items-center">
                  <Settings className="mr-2 h-4 w-4" /> Project Settings
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="col-span-1 md:col-span-2 lg:col-span-2">
                <h2 className="text-xl font-semibold mb-4">Site Structure</h2>
                <div className="bg-gray-50 p-4 rounded-lg">{renderSiteStructure(siteStructure)}</div>
                <div className="mt-4 flex gap-4">
                  <Button variant="secondary" size="sm" className="flex items-center">
                    <Plus className="mr-2 h-4 w-4" /> Add Page
                  </Button>
                  <Button variant="secondary" size="sm" className="flex items-center">
                    <Minus className="mr-2 h-4 w-4" /> Remove Page
                  </Button>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4">SEO Health</h2>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-blue-100 text-blue-800 text-4xl font-bold">
                    {seoScore}
                  </div>
                  <p className="mt-2 text-sm text-gray-600">Overall SEO Score</p>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4">Collaborators</h2>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <ul className="space-y-2 mb-4">
                    {collaborators.map((collaborator) => (
                      <li key={collaborator.user_id} className="flex items-center">
                        <img
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(collaborator.name)}`}
                          alt={collaborator.name}
                          className="w-8 h-8 rounded-full mr-2"
                        />
                        <span>{collaborator.name}</span>
                        <span className="ml-2 text-sm text-gray-500">({collaborator.role})</span>
                      </li>
                    ))}
                  </ul>
                  <Button variant="outline" size="sm" className="w-full flex items-center justify-center">
                    <Users className="mr-2 h-4 w-4" /> Invite Collaborator
                  </Button>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <ul className="space-y-2">
                  {recentActivity.slice(0, 5).map((activity) => (
                    <li key={activity.id} className="py-2 border-b border-gray-200 last:border-b-0">
                      <p className="text-sm text-gray-600">{activity.description}</p>
                      <p className="text-xs text-gray-400">{new Date(activity.timestamp).toLocaleString()}</p>
                    </li>
                  ))}
                </ul>
                <Link to={`/projects/${project_id}/activity`} className="text-sm text-blue-600 hover:underline mt-2 block text-right">
                  View More
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UV_ProjectOverview;