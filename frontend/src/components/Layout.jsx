import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import DatasetSwitcher from './DatasetSwitcher';
import PlatformIcon from './PlatformIcon';
import { useAuth } from '../context/AuthContext';
import { useDataset } from '../context/DatasetContext';

const navItems = [
  { to: '/', icon: '⌂', label: 'For You' },
  { to: '/videos', icon: '▣', label: 'Top Content' },
  { to: '/trending', icon: '♨', label: 'Trending' },
  { to: '/creators', icon: '♙', label: 'Creators' },
  { to: '/pipeline', icon: '✦', label: 'Intelligence' },
];

const platformItems = [
  { to: '/videos', icon: '▦', label: 'All Platforms' },
  { to: '/platforms/reddit', platform: 'reddit', label: 'Reddit Intelligence' },
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
            <div className="brand-copy"><h1>Luna</h1><span>Content Intelligence</span></div>
            <span className="brand-sparkle" aria-hidden="true">✦</span>
          </div>
        </div>

        <div className="sidebar-workspace"><DatasetSwitcher /><span className="sidebar-workspace-mini" aria-hidden="true">◎</span><span className="sidebar-workspace-count">{workspaceCount}</span></div>

        <nav className="sidebar-nav" aria-label="Main navigation">
          <p className="sidebar-section-label">Main</p>
          {navItems.map((item) => <NavLink key={item.to} to={item.to} end={item.to === '/'} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} onClick={() => setMenuOpen(false)} title={item.label} aria-label={item.label}><span className="nav-icon">{item.icon}</span><span className="nav-label">{item.label}</span></NavLink>)}
        </nav>

        <nav className="sidebar-platforms" aria-label="Source Intelligence">
          <p className="sidebar-section-label">Sources</p>
          {platformItems.map((item) => <NavLink key={item.to} to={item.to} end={item.to === '/videos'} className={({ isActive }) => `nav-link platform-nav-link${isActive ? ' active' : ''}`} onClick={() => setMenuOpen(false)} title={item.label} aria-label={item.label}><span className="nav-icon">{item.platform ? <PlatformIcon platform={item.platform} size={17} /> : item.icon}</span><span className="nav-label">{item.label}</span></NavLink>)}
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-pin-control" onClick={togglePinned} aria-label={isPinned ? 'Unpin navigation' : 'Pin navigation'} title={isPinned ? 'Unpin navigation' : 'Pin navigation'}><span aria-hidden="true">{isPinned ? '⊙' : '⊖'}</span><span className="nav-label">{isPinned ? 'Pinned' : 'Pin navigation'}</span></button>
          <button className="theme-toggle" onClick={() => setTheme((prev) => prev === 'dark' ? 'light' : 'dark')} aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'} title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}><span className="theme-toggle-icon">{theme === 'dark' ? '☼' : '☾'}</span><span className="nav-label">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span></button>
          {user && <button className="theme-toggle sidebar-logout" onClick={logout} aria-label="Logout" title="Logout"><span className="theme-toggle-icon">↪</span><span className="nav-label">Logout</span></button>}
          <div className="sidebar-profile" title={user ? `${user.username}, Administrator` : 'System Online'}><span className="health-dot online" aria-hidden="true" /><span className="sidebar-avatar" aria-hidden="true">{user ? user.username.slice(0, 1).toUpperCase() : 'L'}</span><div><strong>{user ? user.username : 'System Online'}</strong><span>{user ? 'Administrator' : 'Connected'}</span></div><span className="sidebar-profile-chevron nav-label" aria-hidden="true">⌄</span></div>
        </div>
      </aside>
      <main className="main-content"><Outlet /></main>
    </div>
  );
}
