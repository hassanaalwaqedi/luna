import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export default function EmptyDataset({ message, datasetLabel }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="empty-dataset">
      <div className="empty-dataset-icon">📭</div>
      <h3 className="empty-dataset-title">{t('noDataInCurrentWorkspace')}</h3>
      {datasetLabel && (
        <p className="empty-dataset-label">Dataset: {datasetLabel}</p>
      )}
      <p className="empty-dataset-message">
        {message || 'Your current workspace has no processed videos. Try running the pipeline with broader settings.'}
      </p>
      <div className="empty-dataset-tips">
        <span>💡 Tips:</span>
        <ul>
          <li>{t('addMoreRegionsInPipeline')}</li>
          <li>{t('removeRestrictiveKeywordFilters')}</li>
          <li>Enable more platforms (YouTube, TikTok, Instagram, Reddit)</li>
          <li>{t('switchToADifferentDataset')}</li>
        </ul>
      </div>
      <div className="empty-dataset-actions">
        <button className="btn-primary" onClick={() => navigate('/pipeline')}>{t('runPipeline')}</button>
      </div>
    </div>
  );
}
