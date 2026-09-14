import { useTranslation } from 'react-i18next';
const DEFAULT_THUMBNAIL = 'https://via.placeholder.com/320x180.png?text=No+Thumbnail';

export default function TranscriptModal({ video, data, loading, error, onClose }) {
  const { t } = useTranslation();
  if (!loading && !error && !data) return null;

  return (
    <div className="transcript-modal-overlay" onClick={onClose}>
      <div className="transcript-modal transcript-modal-upgraded" onClick={(e) => e.stopPropagation()}>

        {/* Loading State */}
        {loading && (
          <div className="loading" style={{ padding: '3rem' }}>
            <div className="spinner"></div>{t('fetchingTranscript')}</div>
        )}

        {/* Error State */}
        {error && (
          <>
            <div className="transcript-modal-header">
              <h3 className="transcript-modal-title">{t('transcriptUnavailable')}</h3>
              <button className="transcript-modal-close" onClick={onClose}>✕</button>
            </div>
            <div className="transcript-error">
              <span style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>⚠️</span>
              <p>{error}</p>
            </div>
          </>
        )}

        {/* Data State */}
        {data && (
          <>
            {/* Video Header with Thumbnail */}
            {video && (
              <div className="tm-video-header">
                <img
                  src={video.thumbnail_url || DEFAULT_THUMBNAIL}
                  alt={video.title || 'Video'}
                  className="tm-video-thumb"
                  onError={(e) => { e.target.src = DEFAULT_THUMBNAIL; }}
                />
                <div className="tm-video-info">
                  <h3 className="tm-video-title">{video.title || 'Untitled'}</h3>
                  <p className="tm-video-channel">{video.channel || 'Unknown channel'}</p>
                  {data.cached && <span className="badge badge-green">{t('cached')}</span>}
                </div>
                <button className="transcript-modal-close" onClick={onClose}>✕</button>
              </div>
            )}

            {!video && (
              <div className="transcript-modal-header">
                <h3 className="transcript-modal-title">
                  📝 Video Transcript
                  {data.cached && <span className="badge badge-green" style={{ marginLeft: 8 }}>{t('cached')}</span>}
                </h3>
                <button className="transcript-modal-close" onClick={onClose}>✕</button>
              </div>
            )}

            {/* First 30 Seconds */}
            <div className="transcript-section">
              <h4 className="transcript-section-title tm-30s-title">⏱️ First 30 Seconds</h4>
              <p className="transcript-preview tm-30s-preview">
                {data.transcript_30s || 'N/A'}
              </p>
            </div>

            {/* Full Transcript */}
            <div className="transcript-section">
              <h4 className="transcript-section-title">📄 Full Transcript</h4>
              <div className="transcript-full">
                {data.transcript || 'No transcript content.'}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
