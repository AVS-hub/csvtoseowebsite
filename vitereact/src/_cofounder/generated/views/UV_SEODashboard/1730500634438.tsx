import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import { RootState, AppDispatch } from '@/store/main';
import axios from 'axios';

const UV_SEODashboard: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const { project_id } = useParams<{ project_id: string }>();
  const userAuth = useSelector((state: RootState) => state.user_auth);
  const currentProject = useSelector((state: RootState) => state.current_project);

  const [overallSEOScore, setOverallSEOScore] = useState<number>(0);
  const [pageSEOScores, setPageSEOScores] = useState<Array<{ page_id: string; title: string; url_slug: string; seo_score: number }>>([]);
  const [keywordAnalysis, setKeywordAnalysis] = useState<{ top_keywords: Array<{ keyword: string; count: number }>; keyword_density: number; suggested_keywords: string[] } | null>(null);
  const [technicalSEOChecklist, setTechnicalSEOChecklist] = useState<Array<{ item: string; status: 'pass' | 'fail' | 'warning'; description: string }>>([]);
  const [backlinkOpportunities, setBacklinkOpportunities] = useState<Array<{ website: string; relevance_score: number; contact_info: string }>>([]);
  const [contentGapAnalysis, setContentGapAnalysis] = useState<{ suggested_topics: string[]; competitor_comparison: Array<{ competitor: string; overlap_percentage: number; unique_topics: string[] }> } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSEOData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`http://localhost:1337/api/projects/${project_id}/seo`, {
        headers: { Authorization: `Bearer ${userAuth.token}` },
      });
      const data = response.data;
      setOverallSEOScore(data.overall_seo_score);
      setPageSEOScores(data.page_seo_scores);
      setKeywordAnalysis(data.keyword_analysis);
      setTechnicalSEOChecklist(data.technical_seo_checklist);
      setBacklinkOpportunities(data.backlink_opportunities);
      setContentGapAnalysis(data.content_gap_analysis);
    } catch (err) {
      setError('Failed to fetch SEO data. Please try again.');
      console.error('Error fetching SEO data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [project_id, userAuth.token]);

  useEffect(() => {
    fetchSEOData();
  }, [fetchSEOData]);

  const updatePageSEO = async (page_id: string) => {
    try {
      const response = await axios.get(`http://localhost:1337/api/projects/${project_id}/pages/${page_id}/seo`, {
        headers: { Authorization: `Bearer ${userAuth.token}` },
      });
      // Navigate to content editor with SEO data
      // This is a placeholder as actual navigation logic would depend on your routing setup
      console.log('Navigate to content editor with SEO data:', response.data);
    } catch (err) {
      console.error('Error fetching page SEO data:', err);
    }
  };

  const runSEOAudit = async () => {
    try {
      await axios.post(`http://localhost:1337/api/projects/${project_id}/seo/audit`, {}, {
        headers: { Authorization: `Bearer ${userAuth.token}` },
      });
      fetchSEOData(); // Refresh data after audit
    } catch (err) {
      console.error('Error running SEO audit:', err);
    }
  };

  const generateSEOReport = async () => {
    try {
      const response = await axios.post(`http://localhost:1337/api/projects/${project_id}/seo/report`, {}, {
        headers: { Authorization: `Bearer ${userAuth.token}` },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'seo_report.pdf');
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      console.error('Error generating SEO report:', err);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading SEO data...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">SEO Dashboard for {currentProject?.name}</h1>

        {/* Overall SEO Score */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Overall SEO Score</h2>
          <div className="flex items-center">
            <div className="text-6xl font-bold text-blue-600">{overallSEOScore}</div>
            <div className="ml-4 text-gray-600">/ 100</div>
          </div>
        </div>

        {/* Page-by-Page SEO Analysis */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Page-by-Page SEO Analysis</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
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
                    <td className="px-4 py-2">{page.seo_score}</td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => updatePageSEO(page.page_id)}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-2 rounded text-sm"
                      >
                        Edit SEO
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Keyword Analysis */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Keyword Analysis</h2>
          {keywordAnalysis && (
            <>
              <div className="mb-4">
                <h3 className="text-xl font-semibold mb-2">Top Keywords</h3>
                <ul>
                  {keywordAnalysis.top_keywords.map((kw, index) => (
                    <li key={index} className="mb-1">
                      {kw.keyword}: {kw.count} occurrences
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mb-4">
                <h3 className="text-xl font-semibold mb-2">Keyword Density</h3>
                <p>{keywordAnalysis.keyword_density.toFixed(2)}%</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Suggested Keywords</h3>
                <ul className="list-disc list-inside">
                  {keywordAnalysis.suggested_keywords.map((kw, index) => (
                    <li key={index}>{kw}</li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>

        {/* Technical SEO Checklist */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Technical SEO Checklist</h2>
          <ul>
            {technicalSEOChecklist.map((item, index) => (
              <li key={index} className="mb-2">
                <span className={`inline-block w-4 h-4 rounded-full mr-2 ${item.status === 'pass' ? 'bg-green-500' : item.status === 'fail' ? 'bg-red-500' : 'bg-yellow-500'}`}></span>
                <span className="font-semibold">{item.item}:</span> {item.description}
              </li>
            ))}
          </ul>
        </div>

        {/* Backlink Opportunities */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Backlink Opportunities</h2>
          <ul>
            {backlinkOpportunities.map((opportunity, index) => (
              <li key={index} className="mb-2">
                <span className="font-semibold">{opportunity.website}</span>
                <br />
                Relevance Score: {opportunity.relevance_score}
                <br />
                Contact: {opportunity.contact_info}
              </li>
            ))}
          </ul>
        </div>

        {/* Content Gap Analysis */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Content Gap Analysis</h2>
          {contentGapAnalysis && (
            <>
              <div className="mb-4">
                <h3 className="text-xl font-semibold mb-2">Suggested Topics</h3>
                <ul className="list-disc list-inside">
                  {contentGapAnalysis.suggested_topics.map((topic, index) => (
                    <li key={index}>{topic}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Competitor Comparison</h3>
                {contentGapAnalysis.competitor_comparison.map((competitor, index) => (
                  <div key={index} className="mb-2">
                    <p className="font-semibold">{competitor.competitor}</p>
                    <p>Overlap: {competitor.overlap_percentage}%</p>
                    <p>Unique Topics: {competitor.unique_topics.join(', ')}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            onClick={runSEOAudit}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
          >
            Run Full SEO Audit
          </button>
          <button
            onClick={generateSEOReport}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          >
            Generate SEO Report
          </button>
          <button
            onClick={fetchSEOData}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
          >
            Refresh SEO Data
          </button>
        </div>
      </div>
    </>
  );
};

export default UV_SEODashboard;