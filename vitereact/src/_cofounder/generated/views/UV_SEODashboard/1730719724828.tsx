import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { RootState, AppDispatch } from '@/store/main';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

interface PageSEOScore {
  page_id: string;
  title: string;
  url_slug: string;
  seo_score: number;
}

interface KeywordAnalysis {
  top_keywords: Array<{ keyword: string; count: number }>;
  keyword_density: number;
  suggested_keywords: Array<string>;
}

interface TechnicalSEOItem {
  item: string;
  status: 'pass' | 'fail' | 'warning';
  description: string;
}

interface BacklinkOpportunity {
  website: string;
  relevance_score: number;
  contact_info: string;
}

interface ContentGapAnalysis {
  suggested_topics: Array<string>;
  competitor_comparison: Array<{
    competitor: string;
    overlap_percentage: number;
    unique_topics: Array<string>;
  }>;
}

const UV_SEODashboard: React.FC = () => {
  const { project_id } = useParams<{ project_id: string }>();
  const dispatch: AppDispatch = useDispatch();
  const userAuth = useSelector((state: RootState) => state.user_auth);
  const currentProject = useSelector((state: RootState) => state.current_project);

  const [overallSEOScore, setOverallSEOScore] = useState<number>(0);
  const [pageSEOScores, setPageSEOScores] = useState<PageSEOScore[]>([]);
  const [keywordAnalysis, setKeywordAnalysis] = useState<KeywordAnalysis | null>(null);
  const [technicalSEOChecklist, setTechnicalSEOChecklist] = useState<TechnicalSEOItem[]>([]);
  const [backlinkOpportunities, setBacklinkOpportunities] = useState<BacklinkOpportunity[]>([]);
  const [contentGapAnalysis, setContentGapAnalysis] = useState<ContentGapAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSEOData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/api/projects/${project_id}/seo`, {
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
      setError('Failed to fetch SEO data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [project_id, userAuth.token]);

  useEffect(() => {
    fetchSEOData();
  }, [fetchSEOData]);

  const handleUpdatePageSEO = async (page_id: string) => {
    try {
      const response = await axios.get(`/api/projects/${project_id}/pages/${page_id}/seo`, {
        headers: { Authorization: `Bearer ${userAuth.token}` },
      });
      // Handle the response, e.g., open a modal with the detailed SEO data
      console.log('Page SEO data:', response.data);
    } catch (err) {
      setError('Failed to fetch page SEO data. Please try again later.');
    }
  };

  const handleRunSEOAudit = async () => {
    try {
      const response = await axios.post(`/api/projects/${project_id}/seo/audit`, {}, {
        headers: { Authorization: `Bearer ${userAuth.token}` },
      });
      // Handle the response, e.g., show a success message and update the dashboard
      console.log('SEO Audit initiated:', response.data);
      fetchSEOData();
    } catch (err) {
      setError('Failed to initiate SEO audit. Please try again later.');
    }
  };

  const handleGenerateSEOReport = async () => {
    try {
      const response = await axios.post(`/api/projects/${project_id}/seo/report`, {}, {
        headers: { Authorization: `Bearer ${userAuth.token}` },
      });
      // Handle the response, e.g., provide a download link for the report
      console.log('SEO Report generated:', response.data);
    } catch (err) {
      setError('Failed to generate SEO report. Please try again later.');
    }
  };

  const PageSEOScoreRow = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const page = pageSEOScores[index];
    return (
      <div style={style} className="flex items-center justify-between p-2 border-b">
        <div className="flex-1">
          <h3 className="font-semibold">{page.title}</h3>
          <p className="text-sm text-gray-600">{page.url_slug}</p>
        </div>
        <div className="flex items-center space-x-4">
          <span className="font-bold">{page.seo_score}</span>
          <button
            onClick={() => handleUpdatePageSEO(page.page_id)}
            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
          >
            Edit
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">SEO Dashboard</h1>
        
        {isLoading && <p className="text-center">Loading SEO data...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}
        
        {!isLoading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Overall SEO Score */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Overall SEO Score</h2>
              <div className="w-48 h-48 mx-auto">
                <CircularProgressbar
                  value={overallSEOScore}
                  text={`${overallSEOScore}%`}
                  styles={buildStyles({
                    textSize: '16px',
                    pathColor: `rgba(62, 152, 199, ${overallSEOScore / 100})`,
                    textColor: '#3e98c7',
                    trailColor: '#d6d6d6',
                  })}
                />
              </div>
            </div>

            {/* Page-by-page SEO Analysis */}
            <div className="bg-white p-6 rounded-lg shadow-md col-span-2">
              <h2 className="text-xl font-semibold mb-4">Page SEO Scores</h2>
              <div className="h-96">
                <AutoSizer>
                  {({ height, width }) => (
                    <List
                      height={height}
                      itemCount={pageSEOScores.length}
                      itemSize={50}
                      width={width}
                    >
                      {PageSEOScoreRow}
                    </List>
                  )}
                </AutoSizer>
              </div>
            </div>

            {/* Keyword Analysis */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Keyword Analysis</h2>
              {keywordAnalysis && (
                <>
                  <h3 className="font-semibold mt-2">Top Keywords</h3>
                  <ul className="list-disc pl-5">
                    {keywordAnalysis.top_keywords.map((kw, index) => (
                      <li key={index}>
                        {kw.keyword} ({kw.count})
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2">
                    <strong>Keyword Density:</strong> {keywordAnalysis.keyword_density.toFixed(2)}%
                  </p>
                  <h3 className="font-semibold mt-4">Suggested Keywords</h3>
                  <ul className="list-disc pl-5">
                    {keywordAnalysis.suggested_keywords.map((kw, index) => (
                      <li key={index}>{kw}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>

            {/* Technical SEO Checklist */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Technical SEO Checklist</h2>
              <ul className="space-y-2">
                {technicalSEOChecklist.map((item, index) => (
                  <li key={index} className="flex items-center">
                    <span
                      className={`w-4 h-4 rounded-full mr-2 ${
                        item.status === 'pass'
                          ? 'bg-green-500'
                          : item.status === 'fail'
                          ? 'bg-red-500'
                          : 'bg-yellow-500'
                      }`}
                    ></span>
                    <span>{item.item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Backlink Opportunities */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Backlink Opportunities</h2>
              <ul className="space-y-4">
                {backlinkOpportunities.map((opportunity, index) => (
                  <li key={index}>
                    <h3 className="font-semibold">{opportunity.website}</h3>
                    <p>Relevance Score: {opportunity.relevance_score}</p>
                    <p className="text-sm text-gray-600">{opportunity.contact_info}</p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Content Gap Analysis */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Content Gap Analysis</h2>
              {contentGapAnalysis && (
                <>
                  <h3 className="font-semibold mt-2">Suggested Topics</h3>
                  <ul className="list-disc pl-5">
                    {contentGapAnalysis.suggested_topics.map((topic, index) => (
                      <li key={index}>{topic}</li>
                    ))}
                  </ul>
                  <h3 className="font-semibold mt-4">Competitor Comparison</h3>
                  {contentGapAnalysis.competitor_comparison.map((competitor, index) => (
                    <div key={index} className="mt-2">
                      <p>
                        <strong>{competitor.competitor}:</strong> {competitor.overlap_percentage}% overlap
                      </p>
                      <p>Unique topics: {competitor.unique_topics.join(', ')}</p>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        )}

        <div className="mt-8 flex justify-center space-x-4">
          <button
            onClick={fetchSEOData}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Refresh SEO Data
          </button>
          <button
            onClick={handleRunSEOAudit}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Run Full SEO Audit
          </button>
          <button
            onClick={handleGenerateSEOReport}
            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
          >
            Generate SEO Report
          </button>
        </div>
      </div>
    </>
  );
};

export default React.memo(UV_SEODashboard);