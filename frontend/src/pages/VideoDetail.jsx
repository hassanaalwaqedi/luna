import { useTranslation } from 'react-i18next';
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api/client';
import { exportTranscriptPDF } from '../api/export';
import ContentGeneratorModal from '../components/ContentGeneratorModal';
import PlatformIcon from '../components/PlatformIcon';
import { fmt, getPlatformColor, getPlatformLabel } from '../utils/platform';
import './VideoDetail.css';
function getSourceUrl(video) {
  const id = video.video_id || '';
  switch (video.platform) {
    case 'tiktok':
      return video.source_url || `https://www.tiktok.com/@${video.channel || 'video'}/video/${id.replace(/^tiktok_/, '')}`;
    case 'instagram':
      return video.source_url || `https://www.instagram.com/p/${id.replace(/^ig_/, '')}/`;
    case 'reddit':
      return video.source_url || `https://www.reddit.com/search/?q=${encodeURIComponent(video.title || '')}`;
    default:
      return `https://www.youtube.com/watch?v=${id}`;
  }
}
function getSourceLabel(platform) {
  const labels = {
    youtube: 'Open on YouTube',
    tiktok: 'Open on TikTok',
    instagram: 'Open on Instagram',
    reddit: 'Search on Reddit'
  };
  return labels[platform] || `Open on ${getPlatformLabel(platform)}`;
}
function wordCount(text) {
  return text ? text.trim().split(/\s+/).filter(Boolean).length : 0;
}
function isPending(value) {
  return !value || value === 'Analysis pending';
}
function paragraphs(text) {
  return text ? text.split(/\n{2,}|\n/).map(part => part.trim()).filter(Boolean) : [];
}
function Metric({
  icon,
  label,
  value,
  tone
}) {
  return <div className={`vd-metric vd-metric-${tone}`}><span aria-hidden="true">{icon}</span><div><strong>{value}</strong><small>{label}</small></div></div>;
}
function InsightItem({
  icon,
  label,
  value,
  tone
}) {
  return <article className={`vd-insight-item vd-insight-${tone}`}><span className="vd-insight-icon" aria-hidden="true">{icon}</span><div><h3>{label}</h3><p>{isPending(value) ? 'Luna is analyzing this content...' : value}</p></div></article>;
}
function PendingInsight() {
  const {
    t
  } = useTranslation();
  return <div className="vd-pending"><span aria-hidden="true">✦</span><strong>{t('lunaIsAnalyzingThisContent')}</strong><small>{t('freshIntelligenceWillAppearWhen')}</small></div>;
}
export default function VideoDetail() {
  const {
    t
  } = useTranslation();
  const {
    id
  } = useParams();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [transcriptExpanded, setTranscriptExpanded] = useState(false);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState(false);
  const [generateVideo, setGenerateVideo] = useState(null);
  useEffect(() => {
    api.getVideo(id).then(setVideo).catch(err => setError(err.message)).finally(() => setLoading(false));
  }, [id]);
  const handleCopy = async () => {
    if (!video?.transcript) return;
    try {
      await navigator.clipboard.writeText(video.transcript);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = video.transcript;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      textarea.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };
  const matchCount = useMemo(() => {
    if (!video?.transcript || !searchTerm.trim()) return 0;
    const regex = new RegExp(searchTerm.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    return (video.transcript.match(regex) || []).length;
  }, [video, searchTerm]);
  const transcriptParts = useMemo(() => {
    if (!video?.transcript) return [];
    const chunks = paragraphs(video.transcript);
    if (!searchTerm.trim()) return chunks;
    const regex = new RegExp(`(${searchTerm.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return chunks.map((chunk, chunkIndex) => chunk.split(regex).map((part, index) => index % 2 ? <mark key={`${chunkIndex}-${part}-${index}`}>{part}</mark> : <span key={`${chunkIndex}-${index}`}>{part}</span>));
  }, [video, searchTerm]);
  if (loading) return <div className="vd-loading"><span />{t('loadingContentIntelligence')}</div>;
  if (error) return <div className="vd-error">{t('unableToLoadThisContent')}<span>{error}</span></div>;
  if (!video) return null;
  const platformColor = getPlatformColor(video.platform);
  const score = Number(video.score || 0).toFixed(3);
  const wc = wordCount(video.transcript);
  const descriptionParts = video.description ? video.description.split(/(https?:\/\/[^\s]+)/g) : [];
  const tags = [...new Set([...(video.hashtags || '').split(',').map(tag => tag.trim()).filter(Boolean), video.niche, video.hook_category].filter(Boolean))].slice(0, 6);
  const insightValues = [video.target_audience, video.hook_text, video.content_gap, video.strategic_advice];
  const hasIntelligence = insightValues.some(value => !isPending(value));
  const thumbnail = video.thumbnail_url || video.thumbnail;
  return <div className="vd-page">
      <Link to="/videos" className="vd-back">← <span>{t('backToTopContent')}</span></Link>
      <header className="vd-header">
        <div className="vd-identity">
          <div className="vd-kicker">{t('contentIntelligence')}<span>✦</span></div>
          <h1>{video.title || 'Untitled content'}</h1>
          <div className="vd-meta-line"><span className="vd-platform-pill" style={{
            '--platform-color': platformColor
          }}><PlatformIcon platform={video.platform} size={15} /> {getPlatformLabel(video.platform)}</span>{video.niche && <span className="vd-soft-pill">{video.niche}</span>}{video.channel && <span>by <strong>{video.channel}</strong></span>}{video.published_at && <span>• {new Date(video.published_at).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            })}</span>}</div>
        </div>
        <div className="vd-header-actions"><a className="vd-action vd-action-secondary" href={getSourceUrl(video)} target="_blank" rel="noopener noreferrer">Open source ↗</a><button className="vd-action vd-action-primary" type="button" onClick={() => setGenerateVideo(video)}>✦ Generate similar</button></div>
      </header>

      <section className="vd-hero">
        <div className="vd-video-frame">{thumbnail ? <img src={thumbnail} alt={video.title || 'Content thumbnail'} /> : <div className="vd-thumbnail-fallback"><strong>{(video.title || 'L').charAt(0)}</strong><span>{getPlatformLabel(video.platform)}</span></div>}<div className="vd-video-shade" /><div className="vd-video-badges"><span className="vd-trending-badge">🔥 Trending</span><span className="vd-platform-badge"><PlatformIcon platform={video.platform} size={14} /> {getPlatformLabel(video.platform)}</span></div><span className="vd-score-badge">✦ AI Score {score}</span><div className="vd-play" aria-hidden="true">▶</div></div>
        <aside className="vd-luna-insight"><div className="vd-section-heading"><div><span className="vd-heading-icon">✦</span><div><small>{t('lunaIntelligence')}</small><h2>{t('lunaInsight')}</h2></div></div><span className="vd-live-dot" /></div>{hasIntelligence ? <div className="vd-insight-list"><InsightItem icon="💗" label="Audience" value={video.target_audience} tone="pink" /><InsightItem icon="🔥" label="Hook" value={video.hook_text} tone="peach" /><InsightItem icon="✦" label="Content gap" value={video.content_gap} tone="purple" /><InsightItem icon="🌙" label="Recreate angle" value={video.strategic_advice} tone="cyan" /></div> : <PendingInsight />}</aside>
      </section>

      <section className="vd-metrics" aria-label="Content performance metrics"><Metric icon="◉" label="Views" value={fmt(video.views)} tone="purple" /><Metric icon="♥" label="Likes" value={fmt(video.likes)} tone="pink" /><Metric icon="✦" label="Comments" value={fmt(video.comments)} tone="peach" /><Metric icon="↗" label="Engagement" value={`${(Number(video.engagement_rate || 0) * 100).toFixed(2)}%`} tone="mint" /><Metric icon="☾" label="AI score" value={score} tone="lavender" /></section>

      <section className="vd-section vd-works-section"><div className="vd-section-title"><span>✦</span><div><small>{t('theCreativeRead')}</small><h2>{t('whyThisContentWorks')}</h2></div></div><div className="vd-insight-grid"><InsightItem icon="💗" label="Audience" value={video.target_audience} tone="pink" /><InsightItem icon="🔥" label="Viral drivers" value={video.hook_text || video.hook_category} tone="peach" /><InsightItem icon="✦" label="Content gap" value={video.content_gap} tone="purple" /><InsightItem icon="🌙" label="Creator opportunity" value={video.strategic_advice} tone="cyan" /></div></section>
      {tags.length > 0 && <section className="vd-tags-section"><div className="vd-inline-title">Topics &amp; signals <span>✦</span></div><div className="vd-tags">{tags.map((tag, index) => <span className={`vd-tag vd-tag-${index % 4}`} key={tag}>#{tag}</span>)}</div></section>}
      {video.description && <section className="vd-section vd-description"><div className="vd-card-heading"><div className="vd-inline-title">📝 Description</div><button type="button" onClick={() => setDescriptionExpanded(!descriptionExpanded)}>{descriptionExpanded ? 'Show less ↑' : 'Show more ↓'}</button></div><div className={`vd-description-text ${descriptionExpanded ? 'is-expanded' : ''}`}>{descriptionParts.map((part, index) => part.startsWith('http') ? <a href={part} key={index} target="_blank" rel="noopener noreferrer">{part}</a> : <span key={index}>{part}</span>)}</div></section>}

      <section className="vd-section vd-transcript"><div className="vd-card-heading"><div className="vd-inline-title">🎙 Transcript <span className="vd-available">{video.transcript ? 'Available' : 'Not available'}</span></div>{video.transcript && <div className="vd-transcript-actions"><span>{wc.toLocaleString()} words</span><button type="button" onClick={() => exportTranscriptPDF(video)}>{t('download')}</button><button type="button" onClick={handleCopy}>{copied ? '✓ Copied' : 'Copy'}</button><button type="button" onClick={() => setTranscriptExpanded(!transcriptExpanded)}>{transcriptExpanded ? 'Collapse' : 'Expand'}</button></div>}</div>{video.transcript ? <><div className="vd-transcript-search"><input value={searchTerm} onChange={event => setSearchTerm(event.target.value)} placeholder="Search transcript..." />{searchTerm && <span>{matchCount} match{matchCount === 1 ? '' : 'es'}</span>}</div><div className={`vd-transcript-body ${transcriptExpanded ? 'is-expanded' : ''}`}>{transcriptParts.map((part, index) => <p key={index}>{part}</p>)}</div>{!transcriptExpanded && <button className="vd-show-transcript" type="button" onClick={() => setTranscriptExpanded(true)}>Show full transcript ↓</button>}</> : <div className="vd-pending vd-transcript-pending">{t('transcriptIsNotAvailableFor')}</div>}</section>
      <section className="vd-opportunity"><div><span className="vd-opportunity-icon">💡</span><div><small>{t('lunaCreatorToolkit')}</small><h2>{t('turnThisTrendIntoYour')}</h2><p>Use this content&apos;s signals as a starting point for your next creative.</p></div></div><button className="vd-action vd-action-primary" type="button" onClick={() => setGenerateVideo(video)}>✦ Generate similar</button></section>
      <section className="vd-section vd-details"><div className="vd-inline-title">{t('contentDetails')}</div><div className="vd-details-grid"><div><small>{t('platform')}</small><strong><PlatformIcon platform={video.platform} size={14} /> {getPlatformLabel(video.platform)}</strong></div><div><small>{t('published')}</small><strong>{video.published_at ? new Date(video.published_at).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            }) : '—'}</strong></div><div><small>{t('contentId')}</small><strong>{video.video_id}</strong></div><div><small>{t('transcript')}</small><strong>{video.transcript ? `✓ ${wc.toLocaleString()} words` : 'Not available'}</strong></div><div><small>{t('lastUpdated')}</small><strong>{video.updated_at ? new Date(video.updated_at).toLocaleDateString('en-GB') : '—'}</strong></div><div><small>{t('source')}</small><a href={getSourceUrl(video)} target="_blank" rel="noopener noreferrer">{getSourceLabel(video.platform)} ↗</a></div></div></section>
      {generateVideo && <ContentGeneratorModal video={generateVideo} onClose={() => setGenerateVideo(null)} />}
    </div>;
}