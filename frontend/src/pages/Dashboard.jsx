import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useDataset } from '../context/DatasetContext';
import { fmt } from '../utils/platform';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import WorkspaceContextBar from '../components/dashboard/WorkspaceContextBar';
import MetricCard from '../components/dashboard/MetricCard';
import LiveTrendsSection, { LiveFeedSection } from '../components/dashboard/LiveTrendsSection';
import OpportunityPanel from '../components/dashboard/OpportunityPanel';
import { NicheDistributionPanel, PlatformDistributionPanel, TrendDistributionPanel, ViralHeatmapPanel } from '../components/dashboard/AnalyticsPanels';
import InsightSignalsPanel from '../components/dashboard/InsightSignalsPanel';
import './Dashboard.css';

function DashboardSkeleton() {
  return (
    <div className="dash-loading-grid" aria-label="Loading intelligence dashboard">
      {[0, 1, 2, 3, 4].map((item) => <span key={item} />)}
    </div>
  );
}

function DashboardError({ onRetry }) {
  return (
    <div className="dash-load-error" role="alert">
      <strong>Dashboard data is unavailable.</strong>
      <p>Check the backend connection, then try again.</p>
      <button onClick={onRetry}>Retry dashboard</button>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { datasetId, activeDataset, datasetStats } = useDataset();
  const [stats, setStats] = useState(null);
  const [health, setHealth] = useState(null);
  const [transcriptStats, setTranscriptStats] = useState(null);
  const [trendsResponse, setTrendsResponse] = useState(null);
  const [opportunitiesResponse, setOpportunitiesResponse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const loadDashboard = useCallback(async (manualRefresh = false) => {
    if (manualRefresh) setRefreshing(true);
    setLoadError(false);
    try {
      const [nextStats, nextHealth, nextTranscriptStats, nextTrends, nextOpportunities] = await Promise.all([
        api.getStats(datasetId),
        api.getHealth(),
        api.getTranscriptStats().catch(() => null),
        api.discoverTrends(365, 12, datasetId).catch(() => ({ trends: [] })),
        api.getOpportunities(365, 8, datasetId).catch(() => ({ opportunities: [] })),
      ]);
      setStats(nextStats);
      setHealth(nextHealth);
      setTranscriptStats(nextTranscriptStats);
      setTrendsResponse(nextTrends);
      setOpportunitiesResponse(nextOpportunities);
    } catch (error) {
      console.error('Dashboard load failed:', error);
      setLoadError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [datasetId]);

  useEffect(() => {
    setLoading(true);
    loadDashboard();
  }, [loadDashboard]);

  const trends = useMemo(() => trendsResponse?.trends || [], [trendsResponse]);
  const opportunities = useMemo(() => opportunitiesResponse?.opportunities || [], [opportunitiesResponse]);
  const totalVideos = datasetStats?.total_videos ?? stats?.total_videos ?? 0;
  const trendChartData = useMemo(() => trends.slice(0, 8).map((trend) => ({
    name: trend.trend.length > 17 ? `${trend.trend.slice(0, 17)}…` : trend.trend,
    fullName: trend.trend,
    videos: trend.count || 0,
  })), [trends]);
  const nicheData = useMemo(() => Object.entries(stats?.niche_stats || {}).map(([name, data]) => ({
    name: name.length > 13 ? `${name.slice(0, 13)}…` : name,
    fullName: name,
    videos: data.count || 0,
  })), [stats]);
  const drivers = useMemo(() => [...new Set(opportunities.flatMap((opportunity) => opportunity.reasons || []))], [opportunities]);
  const topOpportunity = opportunities[0];

  return (
    <main className="dashboard-page">
      <DashboardHeader
        refreshing={refreshing}
        onRefresh={() => loadDashboard(true)}
        onOpenPipeline={() => navigate('/pipeline')}
        onSearch={(query) => navigate(`/trending?query=${encodeURIComponent(query)}`)}
      />

      <WorkspaceContextBar dataset={activeDataset} totalVideos={totalVideos} />

      {loadError && !stats ? <DashboardError onRetry={() => loadDashboard(true)} /> : (
        <>
          {loading && !stats ? <DashboardSkeleton /> : (
            <section className="dash-metrics-grid" aria-label="Intelligence metrics">
              <MetricCard icon="⌁" label="Active Trends" value={trends.length} description={`+${trendsResponse?.count || 0} signals across ${trendsResponse?.total_videos_analyzed || 0} items`} tone="purple" />
              <MetricCard icon="♨" label="Viral Potential" value={topOpportunity ? `${Math.round((topOpportunity.opportunity_score || 0) * 100)}%` : null} description={topOpportunity ? `${topOpportunity.trend} opportunity` : 'Waiting for opportunity data'} tone="coral" />
              <MetricCard icon="♥" label="Engagement" value={stats?.avg_engagement_rate ? `${(stats.avg_engagement_rate * 100).toFixed(1)}%` : null} description="Average across analyzed content" tone="cyan" />
              <MetricCard icon="◈" label="Content Analyzed" value={fmt(totalVideos)} description={`${stats?.total_channels || 0} creators indexed`} tone="amber" />
            </section>
          )}

          <LiveTrendsSection trends={trends} loading={loading && !trendsResponse} onOpenTrend={(trend) => navigate(`/videos?trend=${encodeURIComponent(trend)}`)} />

          <section className="dash-lower-grid">
            <OpportunityPanel opportunities={opportunities} loading={loading && !opportunitiesResponse} />
            <PlatformDistributionPanel data={stats?.platform_stats || {}} />
            <ViralHeatmapPanel />
          </section>
          <section className="dash-secondary-grid">
            <TrendDistributionPanel data={trendChartData} />
            <NicheDistributionPanel data={nicheData} />
            <InsightSignalsPanel drivers={drivers} health={health} transcriptStats={transcriptStats} />
          </section>
          <LiveFeedSection trends={trends} opportunities={opportunities} />
        </>
      )}
    </main>
  );
}
