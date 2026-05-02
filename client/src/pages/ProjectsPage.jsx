import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import Modal from '../components/Modal';

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const loadProjects = () => {
    api.getProjects().then(setProjects).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { loadProjects(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) { setError('Project name is required'); return; }
    try {
      await api.createProject({ name, description });
      setShowCreate(false);
      setName('');
      setDescription('');
      loadProjects();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="page-container"><div className="loading"><div className="spinner" /></div></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ New Project</button>
      </div>

      {projects.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📁</div>
          <div className="empty-state-text">No projects yet. Create your first project!</div>
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ Create Project</button>
        </div>
      ) : (
        <div className="project-grid">
          {projects.map(p => (
            <Link key={p.id} to={`/projects/${p.id}`} className="card card-hover project-card" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="project-card-header">
                <div className="project-card-title">{p.name}</div>
                <span className={`badge badge-${p.myRole?.toLowerCase()}`}>{p.myRole}</span>
              </div>
              <div className="project-card-desc">{p.description || 'No description'}</div>
              <div className="project-card-meta">
                <span>👥 {p.memberCount} member{p.memberCount !== 1 ? 's' : ''}</span>
                <span>📋 {p.taskCount} task{p.taskCount !== 1 ? 's' : ''}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {showCreate && (
        <Modal title="Create Project" onClose={() => setShowCreate(false)}>
          {error && <div className="error-msg">{error}</div>}
          <form onSubmit={handleCreate}>
            <div className="form-group">
              <label className="form-label">Project Name</label>
              <input className="form-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="My Project" autoFocus />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-textarea" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What is this project about?" />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Create</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
