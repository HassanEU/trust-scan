import { useEffect, useState } from 'react';
import { Plus, Trash2, Pencil, Check } from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { todayStr, PRIORITY_COLORS } from '../utils';
import {
  PageHeader, Button, Card, Modal, Input, Textarea, Select,
  Loading, EmptyState, ErrorMsg,
} from '../components/UI';
import './Planner.css';

const EMPTY = { title: '', description: '', priority: 'Medium', deadline: '', reminder: '' };

export default function Planner() {
  const { refreshUser } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => {
    api.getTasks(todayStr())
      .then(setTasks)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm(EMPTY); setModal(true); setError(''); };
  const openEdit = (task) => {
    setEditing(task);
    setForm({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      deadline: task.deadline ? task.deadline.split('T')[0] : '',
      reminder: task.reminder ? new Date(task.reminder).toISOString().slice(0, 16) : '',
    });
    setModal(true);
    setError('');
  };

  const handleSave = async () => {
    if (!form.title.trim()) { setError('Please enter a task title'); return; }
    setSaving(true);
    setError('');
    try {
      const body = {
        ...form,
        deadline: form.deadline || null,
        reminder: form.reminder || null,
        date: todayStr(),
      };
      if (editing) {
        await api.updateTask(editing._id, body);
      } else {
        await api.createTask(body);
      }
      setModal(false);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id) => {
    await api.toggleTask(id);
    load();
    refreshUser();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this task?')) return;
    await api.deleteTask(id);
    load();
  };

  const pending = tasks.filter((t) => !t.completed);
  const done = tasks.filter((t) => t.completed);

  if (loading) return <Loading />;

  return (
    <div>
      <PageHeader
        title="Daily Planner"
        subtitle="Plan your day and stay on track"
        action={<Button onClick={openAdd}><Plus size={18} /> Add Task</Button>}
      />

      {tasks.length === 0 ? (
        <Card>
          <EmptyState icon="📋" title="No tasks for today" subtitle="Add your first task to get started!" />
          <div style={{ textAlign: 'center' }}>
            <Button onClick={openAdd}><Plus size={18} /> Add Task</Button>
          </div>
        </Card>
      ) : (
        <>
          {pending.length > 0 && (
            <section className="task-section">
              <h3 className="section-label">Pending ({pending.length})</h3>
              <div className="task-cards">
                {pending.map((t) => (
                  <TaskCard key={t._id} task={t} onToggle={handleToggle} onEdit={openEdit} onDelete={handleDelete} />
                ))}
              </div>
            </section>
          )}
          {done.length > 0 && (
            <section className="task-section">
              <h3 className="section-label done-label">Completed ({done.length})</h3>
              <div className="task-cards">
                {done.map((t) => (
                  <TaskCard key={t._id} task={t} onToggle={handleToggle} onEdit={openEdit} onDelete={handleDelete} />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Task' : 'New Task'}>
        {error && <ErrorMsg message={error} />}
        <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="What do you need to do?" />
        <Textarea label="Description (optional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <Select label="Priority" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </Select>
        <Input label="Deadline" type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
        <Input label="Reminder" type="datetime-local" value={form.reminder} onChange={(e) => setForm({ ...form, reminder: e.target.value })} />
        <div className="form-actions">
          <Button variant="ghost" onClick={() => setModal(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : editing ? 'Update' : 'Add Task'}</Button>
        </div>
      </Modal>
    </div>
  );
}

function TaskCard({ task, onToggle, onEdit, onDelete }) {
  return (
    <Card className={`task-card ${task.completed ? 'completed' : ''}`}>
      <button className="task-check" onClick={() => onToggle(task._id)} aria-label="Toggle complete">
        {task.completed ? <Check size={18} /> : <span className="check-circle" />}
      </button>
      <div className="task-body">
        <div className="task-header">
          <span className="priority-badge" style={{ background: PRIORITY_COLORS[task.priority] + '20', color: PRIORITY_COLORS[task.priority] }}>
            {task.priority}
          </span>
          {task.deadline && <span className="deadline">📅 {new Date(task.deadline).toLocaleDateString()}</span>}
        </div>
        <div className="task-name">{task.title}</div>
        {task.description && <div className="task-desc">{task.description}</div>}
      </div>
      <div className="task-actions">
        <button onClick={() => onEdit(task)} aria-label="Edit"><Pencil size={16} /></button>
        <button onClick={() => onDelete(task._id)} aria-label="Delete" className="delete-btn"><Trash2 size={16} /></button>
      </div>
    </Card>
  );
}
