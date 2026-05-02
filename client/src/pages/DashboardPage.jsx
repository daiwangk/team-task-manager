import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getDashboard().then(setData).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-container"><div className="loading"><div className="spinner" /></div></div>;

  const stats = data?.stats || {};

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome back, {user?.name} 👋</h1>
          <p className="page-subtitle">Here's what's happening across your projects</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card purple">
          <div className="stat-value">{stats.projectCount || 0}</div>
          <div className="stat-label">Projects</div>
        </div>
        <div className="stat-card cyan">
          <div className="stat-value">{stats.total || 0}</div>
          <div className="stat-label">Total Tasks</div>
        </div>
        <div className="stat-card yellow">
          <div className="stat-value">{stats.inProgress || 0}</div>
          <div className="stat-label">In Progress</div>
        </div>
        <div className="stat-card green">
          <div className="stat-value">{stats.done || 0}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-card red">
          <div className="stat-value">{stats.overdue || 0}</div>
          <div className="stat-label">Overdue</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div className="card">
          <h3 style={{ marginBottom: '1rem', fontWeight: 700 }}>📋 My Tasks</h3>
          {(!data?.myTasks || data.myTasks.length === 0) ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No tasks assigned to you</p>
          ) : (
            <div className="task-list">
              {data.myTasks.map(t => (
                <Link key={t.id} to={`/projects/${t.projectId}`} className="task-list-item" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{t.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.project?.name}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span className={`badge badge-${t.status.toLowerCase().replace('_', '-')}`}>{t.status.replace('_', ' ')}</span>
                    <span className={`badge badge-${t.priority.toLowerCase()}`}>{t.priority}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '1rem', fontWeight: 700 }}>⚠️ Overdue Tasks</h3>
          {(!data?.overdueTasks || data.overdueTasks.length === 0) ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No overdue tasks 🎉</p>
          ) : (
            <div className="task-list">
              {data.overdueTasks.map(t => (
                <Link key={t.id} to={`/projects/${t.projectId}`} className="task-list-item" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{t.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.project?.name}</div>
                  </div>
                  <span className="task-card-due overdue">
                    Due {new Date(t.dueDate).toLocaleDateString()}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {data?.projectSummary && data.projectSummary.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h3 style={{ marginBottom: '1rem', fontWeight: 700 }}>📊 Project Overview</h3>
          <div className="project-grid">
            {data.projectSummary.map(p => (
              <Link key={p.id} to={`/projects/${p.id}`} className="card card-hover" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="project-card-title">{p.name}</div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>📝 {p.todo} todo</span>
                  <span style={{ color: 'var(--warning)' }}>🔄 {p.inProgress} active</span>
                  <span style={{ color: 'var(--success)' }}>✅ {p.done} done</span>
                </div>
                {(p.todo + p.inProgress + p.done > 0) && (
                  <div style={{ marginTop: '0.75rem', height: '6px', borderRadius: '3px', background: 'var(--bg-primary)', overflow: 'hidden', display: 'flex' }}>
                    <div style={{ width: `${(p.done / (p.todo + p.inProgress + p.done)) * 100}%`, background: 'var(--success)' }} />
                    <div style={{ width: `${(p.inProgress / (p.todo + p.inProgress + p.done)) * 100}%`, background: 'var(--warning)' }} />
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
