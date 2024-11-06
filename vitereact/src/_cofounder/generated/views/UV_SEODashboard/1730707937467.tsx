import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import { RootState } from '@/store/main';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RefreshCw, FileText, Search } from 'lucide-react';

// Custom hook for fetching and managing SEO data (unchanged)
const useSEOData = (projectId: string) => {
  // ... (keep the existing implementation)
};

const UV_SEODashboard: React.FC = () => {
  const { project_id } = useParams<{ project_id: string }>();
  const { seoData, loading, error, refreshSEOData } = useSEOData(project_id as string);
  const currentProject = useSelector((state: RootState) => state.current_project);
  const [activePage, setActivePage] = useState(1);
  const itemsPerPage = 10;

  const updatePageSEO = async (pageId: string) => {
    // ... (keep the existing implementation)
  };

  const runSEOAudit = async () => {
    // ... (keep the existing implementation)
  };

  const generateSEOReport = async () => {
    // ... (keep the existing implementation)
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">SEO Dashboard</h1>
          <div className="flex space-x-4">
            <Button variant="outline" onClick={refreshSEOData}>
              <RefreshCw className="mr-2 h-4 w-4" /> Refresh SEO Data
            </Button>
            <Button onClick={runSEOAudit}>Run Full SEO Audit</Button>
            <Button variant="secondary" onClick={generateSEOReport}>
              <FileText className="mr-2 h-4 w-4" /> Generate SEO Report
            </Button>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <div className="flex items-center">
            <div className="relative w-24 h-24">
              <svg className="w-full h-full" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#4F46E5"
                  strokeWidth="3"
                  strokeDasharray={`${seoData.overallSEOScore}, 100`}
                />
                <text x="18" y="20.35" className="text-3xl font-bold" textAnchor="middle" fill="#4F46E5">
                  {seoData.overallSEOScore}
                </text>
              </svg>
            </div>
            <div className="ml-6">
              <h2 className="text-2xl font-semibold text-gray-900">Overall SEO Health</h2>
              <p className="mt-1 text-sm text-gray-600">
                Your website's SEO score is {seoData.overallSEOScore}/100. There's room for improvement!
              </p>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Page-by-Page SEO Analysis</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Page Title</TableHead>
                <TableHead>URL Slug</TableHead>
                <TableHead>SEO Score</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedPageSEOScores.map((page) => (
                <TableRow key={page.page_id}>
                  <TableCell className="font-medium">{page.title}</TableCell>
                  <TableCell>{page.url_slug}</TableCell>
                  <TableCell>{page.seo_score}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" onClick={() => updatePageSEO(page.page_id)}>
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-4 flex justify-between items-center">
            <p className="text-sm text-gray-700">
              Showing {(activePage - 1) * itemsPerPage + 1} to{' '}
              {Math.min(activePage * itemsPerPage, seoData.pageSEOScores.length)} of{' '}
              {seoData.pageSEOScores.length} results
            </p>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActivePage((prev) => Math.max(prev - 1, 1))}
                disabled={activePage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActivePage((prev) => Math.min(prev + 1, Math.ceil(seoData.pageSEOScores.length / itemsPerPage)))}
                disabled={activePage === Math.ceil(seoData.pageSEOScores.length / itemsPerPage)}
              >
                Next
              </Button>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Keyword Analysis</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {seoData.keywordAnalysis && (
              <>
                <div className="bg-white shadow-md rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Top Keywords</h3>
                  <ul className="space-y-2">
                    {seoData.keywordAnalysis.top_keywords.map((keyword, index) => (
                      <li key={index} className="text-sm text-gray-600">
                        {keyword.keyword} ({keyword.count} occurrences)
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-white shadow-md rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Keyword Density</h3>
                  <p className="text-3xl font-bold text-indigo-600">
                    {seoData.keywordAnalysis.keyword_density.toFixed(2)}%
                  </p>
                </div>
                <div className="bg-white shadow-md rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Suggested Keywords</h3>
                  <ul className="space-y-2">
                    {seoData.keywordAnalysis.suggested_keywords.map((keyword, index) => (
                      <li key={index} className="text-sm text-gray-600">{keyword}</li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Technical SEO Checklist</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {seoData.technicalSEOChecklist.map((item, index) => (
              <li key={index} className="bg-white shadow-md rounded-lg p-4">
                <div className="flex items-center">
                  <span className={`flex-shrink-0 h-6 w-6 rounded-full ${
                    item.status === 'pass' ? 'bg-green-100' :
                    item.status === 'fail' ? 'bg-red-100' : 'bg-yellow-100'
                  } flex items-center justify-center mr-3`}>
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
                  <p className="text-sm font-medium text-gray-900">{item.item}</p>
                </div>
                <p className="mt-2 text-xs text-gray-500">{item.description}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Backlink Opportunities</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Website</TableHead>
                <TableHead>Relevance Score</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {seoData.backlinkOpportunities.map((opportunity, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{opportunity.website}</TableCell>
                  <TableCell>{opportunity.relevance_score}</TableCell>
                  <TableCell>
                    <Link to={`mailto:${opportunity.contact_info}`} className="text-indigo-600 hover:text-indigo-900">
                      Contact
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {seoData.contentGapAnalysis && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Content Gap Analysis</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white shadow-md rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Suggested Topics</h3>
                <ul className="space-y-2">
                  {seoData.contentGapAnalysis.suggested_topics.map((topic, index) => (
                    <li key={index} className="text-sm text-gray-600">{topic}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-white shadow-md rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Competitor Comparison</h3>
                <ul className="space-y-4">
                  {seoData.contentGapAnalysis.competitor_comparison.map((competitor, index) => (
                    <li key={index}>
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
      </div>
    </>
  );
};

export default UV_SEODashboard;