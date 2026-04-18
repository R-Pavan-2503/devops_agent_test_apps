/**
 * AppHub Shell — Dynamic Multi-App Platform
 *
 * HOW DISCOVERY WORKS:
 * The main app fetches /api/apps from a discovery endpoint (served by the
 * Vite dev server via a virtual plugin or an express proxy).
 * Each entry contains: { name, frontendPort, backendPort }
 * The sidebar is rendered entirely from this data — zero hardcoding.
 *
 * Adding a new app:
 *   1. Create apps/<name>/frontend/  with package.json (include "port": <port>)
 *   2. Create apps/<name>/backend/   with package.json (include "port": <port>)
 *   3. Restart — it appears automatically.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, NavLink, useParams, useNavigate } from 'react-router-dom';

// ─── Sidebar Brand ──────────────────────────────────────────────────
function Brand() {
  return (
    <div className="brand">
      <div className="brand-icon">⚡</div>
      <div>
        <div className="brand-name">AppHub</div>
        <div className="brand-sub">Multi-App Platform</div>
      </div>
    </div>
  );
}

// ─── Sidebar Nav Item ────────────────────────────────────────────────
function NavItem({ app }) {
  const initials = app.name.slice(0, 2).toUpperCase();
  return (
    <NavLink
      to={`/app/${app.name}`}
      className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
    >
      <span className="nav-avatar">{initials}</span>
      <span className="nav-label">{app.displayName}</span>
      <span className="nav-dot" />
    </NavLink>
  );
}

// ─── Sidebar ─────────────────────────────────────────────────────────
function Sidebar({ apps, loading }) {
  return (
    <aside className="sidebar">
      <Brand />
      <div className="nav-section-label">Applications</div>
      <nav className="nav-list">
        {loading && <div className="nav-status">Discovering apps…</div>}
        {!loading && apps.length === 0 && (
          <div className="nav-status">No apps found in <code>apps/</code></div>
        )}
        {apps.map(app => <NavItem key={app.name} app={app} />)}
      </nav>
      <div className="sidebar-footer">
        <span>{apps.length} app{apps.length !== 1 ? 's' : ''} loaded</span>
      </div>
    </aside>
  );
}

// ─── App Frame — renders the sub-app in an iframe ────────────────────
function AppFrame({ apps }) {
  const { appName } = useParams();
  const navigate    = useNavigate();
  const app = apps.find(a => a.name === appName);

  useEffect(() => {
    if (!app && apps.length > 0) navigate(`/app/${apps[0].name}`, { replace: true });
  }, [app, apps, navigate]);

  if (!app) {
    return (
      <div className="frame-placeholder">
        <div className="placeholder-icon">🔍</div>
        <h2>App not found</h2>
        <p>
          <strong>{appName}</strong> isn't registered yet. Create{' '}
          <code>apps/{appName}/frontend/</code> to add it.
        </p>
      </div>
    );
  }

  const src = `http://localhost:${app.frontendPort}`;

  return (
    <div className="frame-wrapper">
      <div className="frame-topbar">
        <div className="frame-topbar-title">
          <span className="frame-dot green" />
          <strong>{app.displayName}</strong>
        </div>
        <div className="frame-topbar-meta">
          <span className="badge">Frontend :{app.frontendPort}</span>
          <span className="badge">Backend :{app.backendPort}</span>
          <a href={src} target="_blank" rel="noreferrer" className="open-btn">
            ↗ Open
          </a>
        </div>
      </div>
      <iframe
        id={`frame-${app.name}`}
        src={src}
        title={app.displayName}
        className="app-iframe"
        allow="clipboard-write; clipboard-read"
      />
    </div>
  );
}

// ─── Welcome Screen ───────────────────────────────────────────────────
function Welcome({ apps }) {
  const navigate = useNavigate();
  return (
    <div className="frame-placeholder">
      <div className="placeholder-icon">🚀</div>
      <h1>Welcome to AppHub</h1>
      <p>Select an app from the sidebar to get started.</p>
      <div className="app-grid">
        {apps.map(app => (
          <button key={app.name} className="app-card" onClick={() => navigate(`/app/${app.name}`)}>
            <div className="app-card-avatar">{app.name.slice(0,2).toUpperCase()}</div>
            <div className="app-card-name">{app.displayName}</div>
            <div className="app-card-ports">:{app.frontendPort}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────
export default function App() {
  const [apps, setApps]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  const fetchApps = useCallback(async () => {
    try {
      const res = await fetch('/api/apps');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setApps(data);
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApps();
    // Poll every 5s so new apps are picked up without a full reload
    const id = setInterval(fetchApps, 5000);
    return () => clearInterval(id);
  }, [fetchApps]);

  return (
    <div className="layout">
      <Sidebar apps={apps} loading={loading} />
      <main className="content">
        {error && (
          <div className="error-banner">
            ⚠️ Discovery error: {error} — Is the main-app dev server running?
          </div>
        )}
        <Routes>
          <Route path="/" element={<Welcome apps={apps} />} />
          <Route path="/app/:appName" element={<AppFrame apps={apps} />} />
        </Routes>
      </main>
    </div>
  );
}
