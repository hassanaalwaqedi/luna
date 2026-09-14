import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
  const { t } = useTranslation();
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  useEffect(() => {
    // Update the document direction based on language
    document.dir = i18n.dir();
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <button 
        onClick={() => changeLanguage('en')}
        style={{
          background: i18n.language === 'en' ? '#3b82f6' : 'transparent',
          color: i18n.language === 'en' ? 'white' : 'inherit',
          border: '1px solid #3b82f6',
          borderRadius: '4px',
          padding: '4px 8px',
          cursor: 'pointer'
        }}
      >{t('en')}</button>
      <button 
        onClick={() => changeLanguage('ar')}
        style={{
          background: i18n.language === 'ar' ? '#3b82f6' : 'transparent',
          color: i18n.language === 'ar' ? 'white' : 'inherit',
          border: '1px solid #3b82f6',
          borderRadius: '4px',
          padding: '4px 8px',
          cursor: 'pointer'
        }}
      >
        عربي
      </button>
    </div>
  );
}
