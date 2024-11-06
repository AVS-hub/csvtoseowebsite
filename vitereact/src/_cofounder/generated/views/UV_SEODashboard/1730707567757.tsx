import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import { RootState } from '@/store/main';
import axios from 'axios';

// Custom hook for fetching and managing SEO data
const useSEOData = (projectId: string) => {
  const [seoData, setSEOData] = useState({
    overallSEOScore: 0,
    pageSEOScores: [],
    keywordAnalysis: null,
    technicalSEOChecklist: [],
    backlinkOpportunities: [],
    contentGapAnalysis: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSEOData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/api/projects/${projectId}/seo`);
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

  return { seoData, loading, error, refreshSEOData: fetchSEOData };
};

const UV_SEODashboard: React.FC = () => {
  const { project_id } = useParams<{ project_id: string }>();
  const { seoData, loading, error, refreshSEOData } = useSEOData(project_id as string);
  const currentProject = useSelector((state: RootState) => state.current_project);
  const [activePage, setActivePage] = useState(1);
  const itemsPerPage = 10;

  const updatePageSEO = async (pageId: string) => {
    try {
      await axios.get(`/api/projects/${project_id}/pages/${pageId}/seo`);
      refreshSEOData();
    } catch (err) {
      console.error('Failed to update page SEO:', err);
    }
  };

  const runSEOAudit = async () => {
    try {
      await axios.post(`/api/projects/${project_id}/seo/audit`);
      refreshSEOData();
    } catch (err) {
      console.error('Failed to run SEO audit:', err);
    }
  };

  const generateSEOReport = async () => {
    try {
      const response = await axios.post(`/api/projects/${project_id}/seo/report`, {}, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'seo_report.pdf');
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      console.error('Failed to generate SEO report:', err);
    }
  };

  const paginatedPageSEOScores = useMemo(() => {
    const startIndex = (activePage - 1) * itemsPerPage;
    return seoData.pageSEOScores.slice(startIndex, startIndex + itemsPerPage);
  }, [seoData.pageSEOScores, activePage]);

  if (loading) {
    return <div className="flex justify-center items-center h-full">Loading SEO data...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">SEO Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">
            Project: {currentProject?.name || 'Unknown Project'}
          </p>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-2xl font-semibold text-gray-900">Overall SEO Score</h2>
            <div className="mt-4 flex items-center">
              <div className="text-5xl font-bold text-indigo-600">{seoData.overallSEOScore}</div>
              <div className="ml-4 text-sm text-gray-500">/ 100</div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Page-by-Page SEO Analysis</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Page Title
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      URL Slug
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      SEO Score
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedPageSEOScores.map((page) => (
                    <tr key={page.page_id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{page.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{page.url_slug}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{page.seo_score}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => updatePageSEO(page.page_id)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(activePage - 1) * itemsPerPage + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(activePage * itemsPerPage, seoData.pageSEOScores.length)}
                  </span>{' '}
                  of <span className="font-medium">{seoData.pageSEOScores.length}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setActivePage((prev) => Math.max(prev - 1, 1))}
                    disabled={activePage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setActivePage((prev) => Math.min(prev + 1, Math.ceil(seoData.pageSEOScores.length / itemsPerPage)))}
                    disabled={activePage === Math.ceil(seoData.pageSEOScores.length / itemsPerPage)}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Keyword Analysis</h2>
            {seoData.keywordAnalysis && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Top Keywords</h3>
                <ul className="list-disc pl-5 mb-4">
                  {seoData.keywordAnalysis.top_keywords.map((keyword, index) => (
                    <li key={index} className="text-sm text-gray-600">
                      {keyword.keyword} ({keyword.count} occurrences)
                    </li>
                  ))}
                </ul>
                <p className="text-sm text-gray-600 mb-2">
                  Keyword Density: {seoData.keywordAnalysis.keyword_density.toFixed(2)}%
                </p>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Suggested Keywords</h3>
                <ul className="list-disc pl-5">
                  {seoData.keywordAnalysis.suggested_keywords.map((keyword, index) => (
                    <li key={index} className="text-sm text-gray-600">{keyword}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Technical SEO Checklist</h2>
            <ul className="divide-y divide-gray-200">
              {seoData.technicalSEOChecklist.map((item, index) => (
                <li key={index} className="py-4">
                  <div className="flex items-center">
                    <span className={`flex-shrink-0 h-6 w-6 rounded-full ${
                      item.status === 'pass' ? 'bg-green-100' :
                      item.status === 'fail' ? 'bg-red-100' : 'bg-yellow-100'
                    } flex items-center justify-center`}>
                      {item.status === 'pass' && (
                        <svg className="h-4 w-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                      {item.status === 'fail' && (
                        <svg className="h-4 w-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      )}
                      {item.status === 'warning' && (
                        <svg className="h-4 w-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      )}
                    </span>
                    <p className="ml-3 text-sm font-medium text-gray-900">{item.item}</p>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">{item.description}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Backlink Opportunities</h2>
            <ul className="divide-y divide-gray-200">
              {seoData.backlinkOpportunities.map((opportunity, index) => (
                <li key={index} className="py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{opportunity.website}</h3>
                      <p className="mt-1 text-sm text-gray-500">Relevance Score: {opportunity.relevance_score}</p>
                    </div>
                    <a href={`mailto:${opportunity.contact_info}`} className="text-indigo-600 hover:text-indigo-900">
                      Contact
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {seoData.contentGapAnalysis && (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Content Gap Analysis</h2>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Suggested Topics</h3>
                <ul className="list-disc pl-5 mb-4">
                  {seoData.contentGapAnalysis.suggested_topics.map((topic, index) => (
                    <li key={index} className="text-sm text-gray-600">{topic}</li>
                  ))}
                </ul>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Competitor Comparison</h3>
                <ul className="divide-y divide-gray-200">
                  {seoData.contentGapAnalysis.competitor_comparison.map((competitor, index) => (
                    <li key={index} className="py-4">
                      <h4 className="text-md font-medium text-gray-900">{competitor.competitor}</h4>
                      <p className="mt-1 text-sm text-gray-500">Overlap: {competitor.overlap_percentage}%</p>
                      <p className="mt-1 text-sm text-gray-500">
                        Unique Topics: {competitor.unique_topics.join(', ')}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-4 mb-8">
          <button
            onClick={refreshSEOData}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Refresh SEO Data
          </button>
          <button
            onClick={runSEOAudit}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Run Full SEO Audit
          </button>
          <button
            onClick={generateSEOReport}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Generate SEO Report
          </button>
        </div>
      </div>
    </>
  );
};

export default UV_SEODashboard;