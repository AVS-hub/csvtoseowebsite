import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store/main';
import axios from 'axios';

// Custom hook for fetching SEO data
const useSEOData = (projectId: string) => {
  const [seoData, setSEOData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const dispatch: AppDispatch = useDispatch();
  const userAuth = useSelector((state: RootState) => state.user_auth);

  const fetchSEOData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`http://localhost:1337/api/projects/${projectId}/seo`, {
        headers: { Authorization: `Bearer ${userAuth.token}` }
      });
      setSEOData(response.data);
    } catch (err) {
      setError('Failed to fetch SEO data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSEOData();
  }, [projectId]);

  return { seoData, loading, error, refetch: fetchSEOData };
};

const UV_SEODashboard: React.FC = () => {
  const { project_id } = useParams<{ project_id: string }>();
  const { seoData, loading, error, refetch } = useSEOData(project_id!);
  const currentProject = useSelector((state: RootState) => state.current_project);
  const dispatch: AppDispatch = useDispatch();

  const runSEOAudit = async () => {
    try {
      await axios.post(`http://localhost:1337/api/projects/${project_id}/seo/audit`);
      refetch();
    } catch (err) {
      console.error('Failed to run SEO audit:', err);
    }
  };

  const generateSEOReport = async () => {
    try {
      const response = await axios.post(`http://localhost:1337/api/projects/${project_id}/seo/report`);
      // Handle the report download here
      console.log('SEO Report generated:', response.data);
    } catch (err) {
      console.error('Failed to generate SEO report:', err);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-full">Loading SEO data...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">SEO Dashboard: {currentProject?.name}</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-4">Overall SEO Score</h2>
            <div className="text-6xl font-bold text-center text-blue-600">
              {seoData.overallSEOScore}%
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
            <div className="flex flex-col space-y-4">
              <button
                onClick={runSEOAudit}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
              >
                Run Full SEO Audit
              </button>
              <button
                onClick={generateSEOReport}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
              >
                Generate SEO Report
              </button>
              <button
                onClick={refetch}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
              >
                Refresh SEO Data
              </button>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-2xl font-semibold mb-4">Page-by-Page SEO Analysis</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 text-left">Page Title</th>
                  <th className="p-2 text-left">URL Slug</th>
                  <th className="p-2 text-left">SEO Score</th>
                  <th className="p-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {seoData.pageSEOScores.map((page: any) => (
                  <tr key={page.page_id} className="border-b">
                    <td className="p-2">{page.title}</td>
                    <td className="p-2">{page.url_slug}</td>
                    <td className="p-2">{page.seo_score}%</td>
                    <td className="p-2">
                      <Link
                        to={`/projects/${project_id}/content/${page.page_id}`}
                        className="text-blue-500 hover:underline"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-4">Keyword Analysis</h2>
            <div>
              <h3 className="text-xl font-semibold mb-2">Top Keywords</h3>
              <ul className="list-disc pl-5">
                {seoData.keywordAnalysis.top_keywords.map((keyword: any, index: number) => (
                  <li key={index}>{keyword.keyword} ({keyword.count} occurrences)</li>
                ))}
              </ul>
            </div>
            <div className="mt-4">
              <h3 className="text-xl font-semibold mb-2">Keyword Density</h3>
              <p>{seoData.keywordAnalysis.keyword_density}%</p>
            </div>
            <div className="mt-4">
              <h3 className="text-xl font-semibold mb-2">Suggested Keywords</h3>
              <ul className="list-disc pl-5">
                {seoData.keywordAnalysis.suggested_keywords.map((keyword: string, index: number) => (
                  <li key={index}>{keyword}</li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-4">Technical SEO Checklist</h2>
            <ul className="space-y-2">
              {seoData.technicalSEOChecklist.map((item: any, index: number) => (
                <li key={index} className="flex items-center">
                  <span className={`w-4 h-4 rounded-full mr-2 ${item.status === 'pass' ? 'bg-green-500' : item.status === 'fail' ? 'bg-red-500' : 'bg-yellow-500'}`}></span>
                  <span>{item.item}: </span>
                  <span className="ml-1 font-semibold">{item.status}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-4">Backlink Opportunities</h2>
            <ul className="space-y-4">
              {seoData.backlinkOpportunities.map((opportunity: any, index: number) => (
                <li key={index} className="border-b pb-2">
                  <h3 className="font-semibold">{opportunity.website}</h3>
                  <p>Relevance Score: {opportunity.relevance_score}</p>
                  <p>Contact: {opportunity.contact_info}</p>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-4">Content Gap Analysis</h2>
            <div>
              <h3 className="text-xl font-semibold mb-2">Suggested Topics</h3>
              <ul className="list-disc pl-5">
                {seoData.contentGapAnalysis.suggested_topics.map((topic: string, index: number) => (
                  <li key={index}>{topic}</li>
                ))}
              </ul>
            </div>
            <div className="mt-4">
              <h3 className="text-xl font-semibold mb-2">Competitor Comparison</h3>
              <ul className="space-y-2">
                {seoData.contentGapAnalysis.competitor_comparison.map((competitor: any, index: number) => (
                  <li key={index}>
                    <p><strong>{competitor.competitor}</strong></p>
                    <p>Overlap: {competitor.overlap_percentage}%</p>
                    <p>Unique Topics: {competitor.unique_topics.join(', ')}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UV_SEODashboard;