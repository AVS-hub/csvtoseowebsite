import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store/main';
import axios from 'axios';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const UV_SEODashboard: React.FC = () => {
  const { project_id } = useParams<{ project_id: string }>();
  const dispatch: AppDispatch = useDispatch();
  const currentProject = useSelector((state: RootState) => state.current_project);
  const userAuth = useSelector((state: RootState) => state.user_auth);

  const [overallSEOScore, setOverallSEOScore] = useState<number>(0);
  const [pageSEOScores, setPageSEOScores] = useState<Array<{
    page_id: string;
    title: string;
    url_slug: string;
    seo_score: number;
  }>>([]);
  const [keywordAnalysis, setKeywordAnalysis] = useState<{
    top_keywords: Array<{ keyword: string; count: number }>;
    keyword_density: number;
    suggested_keywords: Array<string>;
  } | null>(null);
  const [technicalSEOChecklist, setTechnicalSEOChecklist] = useState<Array<{
    item: string;
    status: 'pass' | 'fail' | 'warning';
    description: string;
  }>>([]);
  const [backlinkOpportunities, setBacklinkOpportunities] = useState<Array<{
    website: string;
    relevance_score: number;
    contact_info: string;
  }>>([]);
  const [contentGapAnalysis, setContentGapAnalysis] = useState<{
    suggested_topics: Array<string>;
    competitor_comparison: Array<{
      competitor: string;
      overlap_percentage: number;
      unique_topics: Array<string>;
    }>;
  } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSEOData();
  }, [project_id]);

  const fetchSEOData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`http://localhost:1337/api/projects/${project_id}/seo`, {
        headers: { Authorization: `Bearer ${userAuth.token}` }
      });
      const data = response.data;
      setOverallSEOScore(data.overall_score);
      setPageSEOScores(data.page_scores);
      setKeywordAnalysis(data.keyword_analysis);
      setTechnicalSEOChecklist(data.technical_checklist);
      setBacklinkOpportunities(data.backlink_opportunities);
      setContentGapAnalysis(data.content_gap_analysis);
    } catch (err) {
      setError('Failed to fetch SEO data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const runSEOAudit = async () => {
    try {
      await axios.post(`http://localhost:1337/api/projects/${project_id}/seo/audit`, {}, {
        headers: { Authorization: `Bearer ${userAuth.token}` }
      });
      fetchSEOData();
    } catch (err) {
      setError('Failed to run SEO audit. Please try again.');
    }
  };

  const generateSEOReport = async () => {
    try {
      const response = await axios.post(`http://localhost:1337/api/projects/${project_id}/seo/report`, {}, {
        headers: { Authorization: `Bearer ${userAuth.token}` },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `SEO_Report_${project_id}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      setError('Failed to generate SEO report. Please try again.');
    }
  };

  const updatePageSEO = (page_id: string) => {
    // Navigate to SEO editor for specific page
    // This would typically be handled by React Router
    console.log(`Navigate to SEO editor for page ${page_id}`);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading SEO data...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">SEO Dashboard: {currentProject?.name}</h1>

        {/* Overall SEO Score */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Overall SEO Score</h2>
          <div className="flex items-center justify-center">
            <div style={{ width: '200px', height: '200px' }}>
              <Doughnut
                data={{
                  datasets: [{
                    data: [overallSEOScore, 100 - overallSEOScore],
                    backgroundColor: ['#4CAF50', '#E0E0E0'],
                    borderWidth: 0
                  }]
                }}
                options={{
                  cutout: '80%',
                  plugins: {
                    tooltip: { enabled: false },
                    legend: { display: false }
                  }
                }}
              />
            </div>
            <div className="text-4xl font-bold ml-8">{overallSEOScore}/100</div>
          </div>
        </div>

        {/* Page-by-page SEO Analysis */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Page-by-page SEO Analysis</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 text-left">Page Title</th>
                  <th className="px-4 py-2 text-left">URL Slug</th>
                  <th className="px-4 py-2 text-left">SEO Score</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageSEOScores.map((page) => (
                  <tr key={page.page_id} className="border-b">
                    <td className="px-4 py-2">{page.title}</td>
                    <td className="px-4 py-2">{page.url_slug}</td>
                    <td className="px-4 py-2">{page.seo_score}/100</td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => updatePageSEO(page.page_id)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                      >
                        Quick Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Keyword Analysis */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Keyword Analysis</h2>
          {keywordAnalysis && (
            <div>
              <h3 className="text-xl font-semibold mb-2">Top Keywords</h3>
              <ul className="list-disc list-inside mb-4">
                {keywordAnalysis.top_keywords.map((keyword, index) => (
                  <li key={index}>{keyword.keyword} (Count: {keyword.count})</li>
                ))}
              </ul>
              <p className="mb-2"><strong>Keyword Density:</strong> {keywordAnalysis.keyword_density.toFixed(2)}%</p>
              <h3 className="text-xl font-semibold mb-2">Suggested Keywords</h3>
              <ul className="list-disc list-inside">
                {keywordAnalysis.suggested_keywords.map((keyword, index) => (
                  <li key={index}>{keyword}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Technical SEO Checklist */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Technical SEO Checklist</h2>
          <ul>
            {technicalSEOChecklist.map((item, index) => (
              <li key={index} className="mb-2">
                <span className={`inline-block w-4 h-4 rounded-full mr-2 ${
                  item.status === 'pass' ? 'bg-green-500' :
                  item.status === 'fail' ? 'bg-red-500' : 'bg-yellow-500'
                }`}></span>
                <strong>{item.item}:</strong> {item.description}
              </li>
            ))}
          </ul>
        </div>

        {/* Backlink Opportunities */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Backlink Opportunities</h2>
          <ul>
            {backlinkOpportunities.map((opportunity, index) => (
              <li key={index} className="mb-2">
                <strong>{opportunity.website}</strong> (Relevance Score: {opportunity.relevance_score})
                <p className="text-sm text-gray-600">Contact: {opportunity.contact_info}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Content Gap Analysis */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Content Gap Analysis</h2>
          {contentGapAnalysis && (
            <div>
              <h3 className="text-xl font-semibold mb-2">Suggested Topics</h3>
              <ul className="list-disc list-inside mb-4">
                {contentGapAnalysis.suggested_topics.map((topic, index) => (
                  <li key={index}>{topic}</li>
                ))}
              </ul>
              <h3 className="text-xl font-semibold mb-2">Competitor Comparison</h3>
              {contentGapAnalysis.competitor_comparison.map((competitor, index) => (
                <div key={index} className="mb-4">
                  <h4 className="font-semibold">{competitor.competitor}</h4>
                  <p>Overlap: {competitor.overlap_percentage}%</p>
                  <p>Unique Topics: {competitor.unique_topics.join(', ')}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            onClick={fetchSEOData}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          >
            Refresh SEO Data
          </button>
          <button
            onClick={runSEOAudit}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Run Full SEO Audit
          </button>
          <button
            onClick={generateSEOReport}
            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded"
          >
            Generate SEO Report
          </button>
        </div>
      </div>
    </>
  );
};

export default UV_SEODashboard;