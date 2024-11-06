import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch, set_current_project } from '@/store/main';
import axios from 'axios';
import { TreeView, TreeItem } from '@mui/lab';
import { ExpandMore, ChevronRight } from '@mui/icons-material';
import { VirtualList } from 'react-tiny-virtual-list';

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Project Header */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-800">{projectDetails.name}</h1>
            <p className="text-sm text-gray-600">Created on: {new Date(projectDetails.created_at!).toLocaleDateString()}</p>
            <p className="text-sm text-gray-600">Last modified: {new Date(projectDetails.updated_at!).toLocaleDateString()}</p>
          </div>

          {/* Progress Bar */}
          <div className="px-6 py-4">
            <div className="flex items-center">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 rounded-full h-2"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <span className="ml-4 text-sm font-medium text-gray-700">{progress}% Complete</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="px-6 py-4 flex space-x-4">
            <button
              onClick={handleGenerateContent}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
            >
              Generate Content
            </button>
            <Link
              to={`/projects/${project_id}/preview`}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
            >
              Preview Website
            </Link>
            <button
              onClick={handleExportWebsite}
              className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded"
            >
              Export Website
            </button>
            <Link
              to={`/projects/${project_id}/settings`}
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
            >
              Project Settings
            </Link>
          </div>

          {/* Main Content */}
          <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Site Structure */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Site Structure</h2>
              {renderSiteStructure(siteStructure)}
            </div>

            {/* SEO Health Score */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">SEO Health Score</h2>
              <div className="flex items-center">
                <div className="relative w-32 h-32">
                  <svg className="w-full h-full" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#eee"
                      strokeWidth="2"
                    />
                    <path
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#4CAF50"
                      strokeWidth="2"
                      strokeDasharray={`${seoScore}, 100`}
                    />
                  </svg>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl font-bold">
                    {seoScore}
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Overall SEO Score</p>
                  <p className="text-lg font-semibold">{seoScore}/100</p>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
              <VirtualList
                width="100%"
                height={300}
                itemCount={recentActivity.length}
                itemSize={50}
                renderItem={({ index, style }) => {
                  const activity = recentActivity[index];
                  return (
                    <div key={activity.id} style={style} className="py-2 border-b border-gray-200">
                      <p className="text-sm text-gray-600">{activity.description}</p>
                      <p className="text-xs text-gray-400">{new Date(activity.timestamp).toLocaleString()}</p>
                    </div>
                  );
                }}
              />
            </div>

            {/* Collaborators */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Collaborators</h2>
              <ul className="space-y-2">
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
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const email = (e.target as HTMLFormElement).email.value;
                  handleInviteCollaborator(email);
                  (e.target as HTMLFormElement).reset();
                }}
                className="mt-4"
              >
                <input
                  type="email"
                  name="email"
                  placeholder="Collaborator's email"
                  className="border rounded px-2 py-1 mr-2"
                  required
                />
                <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-2 rounded">
                  Invite
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UV_ProjectOverview;