import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import './index.css';
import Dashboard   from './pages/Dashboard';
import Students    from './pages/Students';
import Courses     from './pages/Courses';
import Enrollments from './pages/Enrollments';
import Attendance  from './pages/Attendance';
import { useState } from 'react';

const NAV = [
  { path: '/',            label: 'Dashboard',   icon: '📊', group: 'Overview' },
  { path: '/students',    label: 'Students',    icon: '👤', group: 'Services' },
  { path: '/courses',     label: 'Courses',     icon: '📚', group: 'Services' },
  { path: '/enrollments', label: 'Enrollments', icon: '🎓', group: 'Services' },
  { path: '/attendance',  label: 'Attendance',  icon: '✅', group: 'Services' },
];

function App() {
  const [pageTitle, setPageTitle] = useState('Dashboard');

  return (
    <Router>
      <div className="app-shell">
        {/* ── Sidebar ── */}
        <aside className="sidebar">
          <div className="sidebar-logo">
            <div className="logo-icon">🧠</div>
            <div>
              <h1>EduBrain</h1>
              <span>Learning Platform</span>
            </div>
          </div>

          <nav className="sidebar-nav">
            {['Overview', 'Services'].map(group => (
              <div key={group}>
                <div className="nav-group-label">{group}</div>
                {NAV.filter(n => n.group === group).map(n => (
                  <NavLink
                    key={n.path}
                    to={n.path}
                    end={n.path === '/'}
                    className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                    onClick={() => setPageTitle(n.label)}
                  >
                    <span className="nav-icon">{n.icon}</span>
                    {n.label}
                  </NavLink>
                ))}
              </div>
            ))}
          </nav>

          <div className="sidebar-footer">
            <div>Group 5 · IAE Semester 4</div>
            <div style={{ marginTop: 2 }}>Telkom University</div>
          </div>
        </aside>

        {/* ── Main ── */}
        <div className="main-content">
          <header className="topbar">
            <div className="topbar-title">{pageTitle}</div>
            <div className="topbar-right">
              <span className="topbar-badge">Microservices API</span>
            </div>
          </header>

          <div className="page">
            <Routes>
              <Route path="/"            element={<Dashboard   setTitle={setPageTitle} />} />
              <Route path="/students"    element={<Students    setTitle={setPageTitle} />} />
              <Route path="/courses"     element={<Courses     setTitle={setPageTitle} />} />
              <Route path="/enrollments" element={<Enrollments setTitle={setPageTitle} />} />
              <Route path="/attendance"  element={<Attendance  setTitle={setPageTitle} />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
