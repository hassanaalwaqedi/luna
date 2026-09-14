import { useTranslation } from 'react-i18next';
export default function PipelineHeader({ config, validation }) {
  const { t } = useTranslation();
  const readiness = validation.valid ? 'Ready to launch' : validation.issues[0] || 'Configuration needs attention';
  return (
    <header className="pi-header">
      <div className="pi-header-mark" aria-hidden="true"><span>AI</span><i /><i /><i /></div>
      <div>
        <h1>{t('aiMarketIntelligence')}</h1>
        <p>{t('configureAndLaunchAnAipowered')}</p>
        <div className={`pi-readiness ${validation.valid ? 'ready' : 'attention'}`}><span aria-hidden="true">●</span>{readiness}<small>{config.regions.length} market{config.regions.length === 1 ? '' : 's'} · {config.platforms.length} platform{config.platforms.length === 1 ? '' : 's'}</small></div>
      </div>
    </header>
  );
}
