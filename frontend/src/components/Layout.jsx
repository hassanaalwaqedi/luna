import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import DatasetSwitcher from './DatasetSwitcher';
import PlatformIcon from './PlatformIcon';
import LanguageSwitcher from './LanguageSwitcher';
import { useAuth } from '../context/AuthContext';
import { useDataset } from '../context/DatasetContext';

const navItems = [
  { to: '/', icon: '⌂', labelKey: 'nav.forYou' },
  { to: '/videos', icon: '▣', labelKey: 'nav.topContent' },
  { to: '/trending', icon: '♨', labelKey: 'nav.trending' },
  { to: '/creators', icon: '♙', labelKey: 'nav.creators' },
  { to: '/pipeline', icon: '✦', labelKey: 'nav.intelligence' },
];

const platformItems = [
  { to: '/videos', icon: '▦', labelKey: 'nav.allPlatforms' },
  { to: '/platforms/reddit', platform: 'reddit', labelKey: 'nav.redditIntelligence' },
];

const THEME_KEY = 'luna-theme';
const LEGACY_THEME_KEY = 'genx-theme';
const SIDEBAR_PIN_KEY = 'luna-sidebar-pinned';

function getInitialTheme() {
  return localStorage.getItem(THEME_KEY) || localStorage.getItem(LEGACY_THEME_KEY) || 'dark';
}

export default function Layout() {
  const [theme, setTheme] = useState(getInitialTheme);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(() => localStorage.getItem(SIDEBAR_PIN_KEY) === 'true');
  const leaveTimer = useRef(null);
  const { user, logout } = useAuth();
  const { activeDataset, datasetStats } = useDataset();
  const { t } = useTranslation();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => () => window.clearTimeout(leaveTimer.current), []);

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, []);

  const handleSidebarEnter = () => {
    window.clearTimeout(leaveTimer.current);
    setIsHovered(true);
  };

  const handleSidebarLeave = () => {
    window.clearTimeout(leaveTimer.current);
    leaveTimer.current = window.setTimeout(() => setIsHovered(false), 380);
  };

  const togglePinned = () => {
    setIsPinned((current) => {
      const next = !current;
      localStorage.setItem(SIDEBAR_PIN_KEY, String(next));
      return next;
    });
  };

  const isExpanded = isHovered || isPinned || menuOpen;
  const workspaceCount = datasetStats?.total_videos ?? activeDataset?.videos_stored ?? 0;

  return (
    <div className="app-layout">
      <button className="mobile-menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-label={menuOpen ? 'Close menu' : 'Open menu'}>
        {menuOpen ? '×' : '☰'}
      </button>
      <div className={`sidebar-overlay${menuOpen ? ' show' : ''}`} onClick={() => setMenuOpen(false)} />

      <aside className={`sidebar${isExpanded ? ' expanded' : ''}${menuOpen ? ' open' : ''}${isPinned ? ' pinned' : ''}`} onMouseEnter={handleSidebarEnter} onMouseLeave={handleSidebarLeave} aria-label="Luna navigation">
        <div className="sidebar-brand">
          <div className="brand-logo-row">
            <img src="/logo.png" alt="Luna logo" className="brand-logo" />
            <div className="brand-copy"><h1>{t('layout.brand')}</h1><span>{t('layout.tagline')}</span></div>
            <span className="brand-sparkle" aria-hidden="true">✦</span>
          </div>
        </div>

        <div className="sidebar-workspace"><DatasetSwitcher /><span className="sidebar-workspace-mini" aria-hidden="true">◎</span><span className="sidebar-workspace-count">{workspaceCount}</span></div>

        <nav className="sidebar-nav" aria-label="Main navigation">
          <p className="sidebar-section-label">{t('nav.mainSection')}</p>
          {navItems.map((item) => <NavLink key={item.to} to={item.to} end={item.to === '/'} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} onClick={() => setMenuOpen(false)} title={t(item.labelKey)} aria-label={t(item.labelKey)}><span className="nav-icon">{item.icon}</span><span className="nav-label">{t(item.labelKey)}</span></NavLink>)}
        </nav>

        <nav className="sidebar-platforms" aria-label="Source Intelligence">
          <p className="sidebar-section-label">{t('nav.sourcesSection')}</p>
          {platformItems.map((item) => <NavLink key={item.to} to={item.to} end={item.to === '/videos'} className={({ isActive }) => `nav-link platform-nav-link${isActive ? ' active' : ''}`} onClick={() => setMenuOpen(false)} title={t(item.labelKey)} aria-label={t(item.labelKey)}><span className="nav-icon">{item.platform ? <PlatformIcon platform={item.platform} size={17} /> : item.icon}</span><span className="nav-label">{t(item.labelKey)}</span></NavLink>)}
        </nav>

        <div className="sidebar-footer">
          <LanguageSwitcher />
          <button className="sidebar-pin-control" onClick={togglePinned} aria-label={isPinned ? t('nav.unpin') : t('nav.pin')} title={isPinned ? t('nav.unpin') : t('nav.pin')}><span aria-hidden="true">{isPinned ? '⊙' : '⊖'}</span><span className="nav-label">{isPinned ? t('nav.pinned') : t('nav.pin')}</span></button>
          <button className="theme-toggle" onClick={() => setTheme((prev) => prev === 'dark' ? 'light' : 'dark')} aria-label={theme === 'dark' ? t('nav.lightMode') : t('nav.darkMode')} title={theme === 'dark' ? t('nav.lightMode') : t('nav.darkMode')}><span className="theme-toggle-icon">{theme === 'dark' ? '☼' : '☾'}</span><span className="nav-label">{theme === 'dark' ? t('nav.lightMode') : t('nav.darkMode')}</span></button>
          {user && <button className="theme-toggle sidebar-logout" onClick={logout} aria-label={t('nav.logout')} title={t('nav.logout')}><span className="theme-toggle-icon">↪</span><span className="nav-label">{t('nav.logout')}</span></button>}
          <div className="sidebar-profile" title={user ? `${user.username}, ${t('nav.admin')}` : t('nav.systemOnline')}><span className="health-dot online" aria-hidden="true" /><span className="sidebar-avatar" aria-hidden="true">{user ? user.username.slice(0, 1).toUpperCase() : 'L'}</span><div><strong>{user ? user.username : t('nav.systemOnline')}</strong><span>{user ? t('nav.admin') : t('nav.connected')}</span></div><span className="sidebar-profile-chevron nav-label" aria-hidden="true">⌄</span></div>
        </div>
      </aside>
      <main className="main-content"><Outlet /></main>
    </div>
  );
}
