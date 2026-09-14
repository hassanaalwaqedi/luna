import { useTranslation } from 'react-i18next';
import PlatformIcon from '../PlatformIcon';
import ScanConfigPanel from './ScanConfigPanel';
import { PLATFORM_IDS } from './pipelineUtils';

export default function PlatformSelectorPanel({ platforms, connectors, onToggle }) {
  const { t } = useTranslation();
  return (
    <ScanConfigPanel step="2" title="Choose Platforms" helper="Select sources for this scan." badge={`${platforms.length} selected`}>
      <div className="pi-platform-list">
        {PLATFORM_IDS.map((platform) => {
          const status = connectors?.[platform]?.status || 'unknown';
          const selected = platforms.includes(platform);
          const unavailable = ['disabled', 'unavailable'].includes(status);
          return <button type="button" key={platform} className={`${selected ? 'selected' : ''} ${unavailable ? 'unavailable' : ''}`} disabled={unavailable && !selected} onClick={() => onToggle(platform)}>
            <PlatformIcon platform={platform} size={19} />
            <span>{platform[0].toUpperCase() + platform.slice(1)}{['tiktok', 'instagram'].includes(platform) && <em>{t('beta')}</em>}</span>
            <small className={status}>{status === 'healthy' ? 'Online' : status}</small>
            {selected && <b aria-label="Selected">✓</b>}
          </button>;
        })}
      </div>
    </ScanConfigPanel>
  );
}
