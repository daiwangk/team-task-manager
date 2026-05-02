import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [error, setError] = useState('');

  // Task form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState('MEDIUM');
  const [taskDue, setTaskDue] = useState('');
  const [taskAssignee, setTaskAssignee] = useState('');

  // Member form
  const [memberEmail, setMemberEmail] = useState('');
  const [memberRole, setMemberRole] = useState('MEMBER');

  const isAdmin = project?.myRole === 'ADMIN';

  const loadProject = () => {
    api.getProject(id).then(setProject).catch(() => navigate('/projects')).finally(() => setLoading(false));
  };

  useEffect(() => { loadProject(); }, [id]);

  const openCreateTask = () => {
    setEditTask(null);
    setTaskTitle(''); setTaskDesc(''); setTaskPriority('MEDIUM'); setTaskDue(''); setTaskAssignee('');
    setShowTaskModal(true);
    setError('');
  };

  const openEditTask = (task) => {
    setEditTask(task);
    setTaskTitle(task.title);
    setTaskDesc(task.description || '');
    setTaskPriority(task.priority);
    setTaskDue(task.dueDate ? task.dueDate.split('T')[0] : '');
    setTaskAssignee(task.assignedToId || '');
    setShowTaskModal(true);
    setError('');
  };

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!taskTitle.trim()) { setError('Title is required'); return; }
    try {
      const data = {
        title: taskTitle, description: taskDesc, priority: taskPriority,
        dueDate: taskDue || null, assignedTo: taskAssignee || null
      };
      if (editTask) {
        await api.updateTask(id, editTask.id, data);
      } else {
        await api.createTask(id, data);
      }
      setShowTaskModal(false);
      loadProject();
    } catch (err) { setError(err.message); }
  };

  const handleStatusChange = async (taskId, status) => {
    try {
      await api.updateTask(id, taskId, { status });
      loadProject();
    } catch (err) { console.error(err); }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Delete this task?')) return;
    try {
      await api.deleteTask(id, taskId);
      loadProject();
    } catch (err) { console.error(err); }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setError('');
    if (!memberEmail.trim()) { setError('Email is required'); return; }
    try {
      await api.addMember(id, { email: memberEmail, role: memberRole });
      setMemberEmail('');
      setShowMemberModal(false);
      loadProject();
    } catch (err) { setError(err.message); }
  };

  const handleRemoveMember = async (userId) => {
    if (!confirm('Remove this member?')) return;
    try { await api.removeMember(id, userId); loadProject(); }
    catch (err) { console.error(err); }
  };

  const handleRoleChange = async (userId, role) => {
    try { await api.updateMemberRole(id, userId, { role }); loadProject(); }
    catch (err) { console.error(err); }
  };

  const handleDeleteProject = async () => {
    if (!confirm('Delete this project and all its tasks? This cannot be undone.')) return;
    try { await api.deleteProject(id); navigate('/projects'); }
    catch (err) { console.error(err); }
  };

  if (loading) return <div className="page-container"><div className="loading"><div className="spinner" /></div></div>;
  if (!project) return null;

  const tasks = project.tasks || [];
  const todoTasks = tasks.filter(t => t.status === 'TODO');
  const inProgressTasks = tasks.filter(t => t.status === 'IN_PROGRESS');
  const doneTasks = tasks.filter(t => t.status === 'DONE');

  const formatDue = (d) => {
    if (!d) return null;
    const date = new Date(d);
    const isOverdue = date < new Date();
    return { text: date.toLocaleDateString(), overdue: isOverdue };
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">{project.name}</h1>
          <p className="page-subtitle">{project.description || 'No description'}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-primary" onClick={openCreateTask}>+ Add Task</button>
          {isAdmin && <button className="btn btn-secondary" onClick={() => { setShowMemberModal(true); setError(''); }}>👥 Members</button>}
          {isAdmin && <button className="btn btn-danger btn-sm" onClick={handleDeleteProject}>Delete</button>}
        </div>
      </div>

      {/* Task Board */}
      <div className="task-columns">
        {[
          { title: 'To Do', tasks: todoTasks, status: 'TODO' },
          { title: 'In Progress', tasks: inProgressTasks, status: 'IN_PROGRESS' },
          { title: 'Done', tasks: doneTasks, status: 'DONE' }
        ].map(col => (
          <div key={col.status} className="task-column">
            <div className="task-column-header">
              <span>{col.title}</span>
              <span className="task-column-count">{col.tasks.length}</span>
            </div>
            {col.tasks.map(task => {
              const due = formatDue(task.dueDate);
              return (
                <div key={task.id} className="task-card" onClick={() => openEditTask(task)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div className="task-card-title">{task.title}</div>
                    <span className={`badge badge-${task.priority.toLowerCase()}`}>{task.priority}</span>
                  </div>
                  {task.description && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.25rem 0 0.5rem' }}>{task.description.substring(0, 80)}</p>}
                  <div className="task-card-meta">
                    {task.assignedTo && <span>👤 {task.assignedTo.name}</span>}
                    {due && <span className={`task-card-due ${due.overdue && task.status !== 'DONE' ? 'overdue' : ''}`}>📅 {due.text}</span>}
                  </div>
                  <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.5rem' }} onClick={(e) => e.stopPropagation()}>
                    {col.status !== 'TODO' && <button className="btn btn-ghost btn-sm" onClick={() => handleStatusChange(task.id, col.status === 'DONE' ? 'IN_PROGRESS' : 'TODO')}>← Back</button>}
                    {col.status !== 'DONE' && <button className="btn btn-ghost btn-sm" onClick={() => handleStatusChange(task.id, col.status === 'TODO' ? 'IN_PROGRESS' : 'DONE')}>Next →</button>}
                    {isAdmin && <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)', marginLeft: 'auto' }} onClick={() => handleDeleteTask(task.id)}>✕</button>}
                  </div>
                </div>
              );
            })}
            {col.tasks.length === 0 && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>No tasks</p>}
          </div>
        ))}
      </div>

      {/* Members Section */}
      <div className="members-section">
        <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>👥 Team Members ({project.members?.length || 0})</h3>
        {project.members?.map(m => (
          <div key={m.id} className="member-item">
            <div className="member-info">
              <div className="member-avatar">{m.user.name.charAt(0).toUpperCase()}</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{m.user.name} {m.userId === user.id && '(You)'}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{m.user.email}</div>
              </div>
            </div>
            <div className="member-actions">
              <span className={`badge badge-${m.role.toLowerCase()}`}>{m.role}</span>
              {isAdmin && m.userId !== user.id && (
                <>
                  <select className="form-select" style={{ width: 'auto', padding: '0.3rem 0.5rem', fontSize: '0.8rem' }}
                    value={m.role} onChange={(e) => handleRoleChange(m.userId, e.target.value)}>
                    <option value="MEMBER">Member</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                  <button className="btn btn-danger btn-sm" onClick={() => handleRemoveMember(m.userId)}>Remove</button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Task Modal */}
      {showTaskModal && (
        <Modal title={editTask ? 'Edit Task' : 'Create Task'} onClose={() => setShowTaskModal(false)}>
          {error && <div className="error-msg">{error}</div>}
          <form onSubmit={handleTaskSubmit}>
            <div className="form-group">
              <label className="form-label">Title</label>
              <input className="form-input" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} placeholder="Task title" autoFocus />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-textarea" value={taskDesc} onChange={(e) => setTaskDesc(e.target.value)} placeholder="Optional description" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Priority</label>
                <select className="form-select" value={taskPriority} onChange={(e) => setTaskPriority(e.target.value)}>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input className="form-input" type="date" value={taskDue} onChange={(e) => setTaskDue(e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Assign To</label>
              <select className="form-select" value={taskAssignee} onChange={(e) => setTaskAssignee(e.target.value)}>
                <option value="">Unassigned</option>
                {project.members?.map(m => (
                  <option key={m.userId} value={m.userId}>{m.user.name} ({m.user.email})</option>
                ))}
              </select>
            </div>
            {editTask && (
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-select" value={editTask.status} onChange={(e) => { setEditTask({ ...editTask, status: e.target.value }); }}>
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="DONE">Done</option>
                </select>
              </div>
            )}
            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setShowTaskModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">{editTask ? 'Update' : 'Create'}</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Member Modal */}
      {showMemberModal && (
        <Modal title="Add Member" onClose={() => setShowMemberModal(false)}>
          {error && <div className="error-msg">{error}</div>}
          <form onSubmit={handleAddMember}>
            <div className="form-group">
              <label className="form-label">User Email</label>
              <input className="form-input" type="email" value={memberEmail} onChange={(e) => setMemberEmail(e.target.value)} placeholder="member@example.com" autoFocus />
            </div>
            <div className="form-group">
              <label className="form-label">Role</label>
              <select className="form-select" value={memberRole} onChange={(e) => setMemberRole(e.target.value)}>
                <option value="MEMBER">Member</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setShowMemberModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Add Member</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
