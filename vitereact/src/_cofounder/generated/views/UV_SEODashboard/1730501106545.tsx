import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import { RootState, AppDispatch } from '@/store/main';
import axios from 'axios';
import { Loader2, RefreshCw, FileText, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

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
      fetchSEOData();
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
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading SEO data...</span>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">SEO Dashboard for {currentProject?.name}</h1>
          <div className="space-x-4">
            <Button onClick={runSEOAudit} variant="default">
              Run Full SEO Audit
            </Button>
            <Button onClick={generateSEOReport} variant="secondary">
              Generate SEO Report
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Overall SEO Health Score */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Overall SEO Health Score</h2>
              <div className="flex items-center justify-between">
                <div className="text-6xl font-bold text-blue-600">{overallSEOScore}<span className="text-2xl text-gray-600">/100</span></div>
                <div className="w-32 h-32 relative">
                  <svg viewBox="0 0 36 36" className="w-full h-full">
                    <path
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#E5E7EB"
                      strokeWidth="3"
                    />
                    <path
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#3B82F6"
                      strokeWidth="3"
                      strokeDasharray={`${overallSEOScore}, 100`}
                    />
                  </svg>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xl font-semibold">
                    {overallSEOScore}%
                  </div>
                </div>
              </div>
              <Button onClick={fetchSEOData} variant="outline" className="mt-4">
                <RefreshCw className="mr-2 h-4 w-4" /> Refresh SEO Data
              </Button>
            </div>

            {/* Page SEO Scores */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Page SEO Scores</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Page Title</TableHead>
                    <TableHead>URL Slug</TableHead>
                    <TableHead>SEO Score</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageSEOScores.map((page) => (
                    <TableRow key={page.page_id}>
                      <TableCell>{page.title}</TableCell>
                      <TableCell>{page.url_slug}</TableCell>
                      <TableCell>{page.seo_score}</TableCell>
                      <TableCell>
                        <Button onClick={() => updatePageSEO(page.page_id)} variant="outline" size="sm">
                          Edit SEO
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Pagination className="mt-4">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious href="#" />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#">1</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext href="#" />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>

            {/* Keyword Analysis */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Keyword Analysis</h2>
              {keywordAnalysis && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Top Keywords</h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Keyword</TableHead>
                            <TableHead>Count</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {keywordAnalysis.top_keywords.map((kw, index) => (
                            <TableRow key={index}>
                              <TableCell>{kw.keyword}</TableCell>
                              <TableCell>{kw.count}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Keyword Density</h3>
                      <p className="text-4xl font-bold text-blue-600">{keywordAnalysis.keyword_density.toFixed(2)}%</p>
                    </div>
                  </div>
                  <div className="mt-6">
                    <h3 className="text-xl font-semibold mb-2">Suggested Keywords</h3>
                    <div className="flex flex-wrap gap-2">
                      {keywordAnalysis.suggested_keywords.map((kw, index) => (
                        <Badge key={index} variant="secondary">{kw}</Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="space-y-8">
            {/* Technical SEO Checklist */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Technical SEO Checklist</h2>
              <Accordion type="single" collapsible className="w-full">
                {technicalSEOChecklist.map((item, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger>
                      <div className="flex items-center">
                        {item.status === 'pass' && <CheckCircle className="mr-2 h-4 w-4 text-green-500" />}
                        {item.status === 'fail' && <XCircle className="mr-2 h-4 w-4 text-red-500" />}
                        {item.status === 'warning' && <AlertTriangle className="mr-2 h-4 w-4 text-yellow-500" />}
                        {item.item}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      {item.description}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>

            {/* Backlink Opportunities */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Backlink Opportunities</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Website</TableHead>
                    <TableHead>Relevance</TableHead>
                    <TableHead>Contact</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {backlinkOpportunities.map((opportunity, index) => (
                    <TableRow key={index}>
                      <TableCell>{opportunity.website}</TableCell>
                      <TableCell>{opportunity.relevance_score}</TableCell>
                      <TableCell>{opportunity.contact_info}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Content Gap Analysis */}
            <div className="bg-white shadow rounded-lg p-6">
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
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Competitor</TableHead>
                          <TableHead>Overlap</TableHead>
                          <TableHead>Unique Topics</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {contentGapAnalysis.competitor_comparison.map((competitor, index) => (
                          <TableRow key={index}>
                            <TableCell>{competitor.competitor}</TableCell>
                            <TableCell>{competitor.overlap_percentage}%</TableCell>
                            <TableCell>{competitor.unique_topics.join(', ')}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UV_SEODashboard;