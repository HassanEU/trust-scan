import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { todayStr, formatMinutes, SUBJECT_COLORS } from '../utils';
import {
  PageHeader, Button, Card, Modal, Input, Select, Loading, EmptyState, ErrorMsg,
} from '../components/UI';
import './Study.css';

export default function Study() {
  const { refreshUser } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [stats, setStats] = useState(null);
  const [period, setPeriod] = useState('week');
  const [loading, setLoading] = useState(true);
  const [sessionModal, setSessionModal] = useState(false);
  const [subjectModal, setSubjectModal] = useState(false);
  const [sessionForm, setSessionForm] = useState({ subjectId: '', minutes: 30, notes: '' });
  const [newSubject, setNewSubject] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const [subs, st] = await Promise.all([
        api.getSubjects(),
        api.getStudyStats(period),
      ]);
      setSubjects(subs);
      setStats(st);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { setLoading(true); load(); }, [period]);

  const handleLogSession = async () => {
    if (!sessionForm.minutes || sessionForm.minutes < 1) {
      setError('Enter study time in minutes');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await api.createStudySession({
        subjectId: sessionForm.subjectId || null,
        minutes: Number(sessionForm.minutes),
        notes: sessionForm.notes,
        date: todayStr(),
      });
      setSessionModal(false);
      setSessionForm({ subjectId: '', minutes: 30, notes: '' });
      load();
      refreshUser();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddSubject = async () => {
    if (!newSubject.trim()) { setError('Enter subject name'); return; }
    setSaving(true);
    try {
      const color = SUBJECT_COLORS[subjects.length % SUBJECT_COLORS.length];
      await api.createSubject({ name: newSubject, color });
      setNewSubject('');
      setSubjectModal(false);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSubject = async (id) => {
    if (!confirm('Delete this subject?')) return;
    await api.deleteSubject(id);
    load();
  };

  if (loading) return <Loading />;

  const chartData = stats?.daily?.map((d) => ({
    name: d.date.slice(5),
    minutes: d.minutes,
  })) || [];

  const pieData = stats?.bySubject || [];

  return (
    <div className="study-page">
      <PageHeader
        title="Study Tracker"
        subtitle="Track your study time and see your progress"
        action={
          <div className="header-actions">
            <Button variant="secondary" onClick={() => { setSubjectModal(true); setError(''); }}>
              <Plus size={16} /> Subject
            </Button>
            <Button onClick={() => { setSessionModal(true); setError(''); }}>
              <Plus size={16} /> Log Session
            </Button>
          </div>
        }
      />

      <div className="period-tabs">
        {['day', 'week', 'month'].map((p) => (
          <button key={p} className={`period-tab ${period === p ? 'active' : ''}`} onClick={() => setPeriod(p)}>
            {p === 'day' ? 'Today' : p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid-3 study-summary">
        <Card className="summary-card">
          <div className="summary-value">{stats?.totalHours || 0}h</div>
          <div className="summary-label">Total Study Time</div>
        </Card>
        <Card className="summary-card">
          <div className="summary-value">{formatMinutes(stats?.totalMinutes || 0)}</div>
          <div className="summary-label">Total Minutes</div>
        </Card>
        <Card className="summary-card">
          <div className="summary-value">{subjects.length}</div>
          <div className="summary-label">Subjects</div>
        </Card>
      </div>

      <div className="study-grid">
        <Card>
          <h3 className="chart-title">Study Time ({period})</h3>
          {chartData.every((d) => d.minutes === 0) ? (
            <EmptyState icon="📊" title="No study data yet" subtitle="Log your first session!" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => [`${v} min`, 'Study']} />
                <Bar dataKey="minutes" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card>
          <h3 className="chart-title">By Subject</h3>
          {pieData.length === 0 ? (
            <EmptyState icon="📚" title="No subjects tracked" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} dataKey="minutes" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={SUBJECT_COLORS[i % SUBJECT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [`${v} min`, 'Study']} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      <Card>
        <h3 className="chart-title">Your Subjects</h3>
        {subjects.length === 0 ? (
          <EmptyState icon="📖" title="No subjects yet" subtitle="Add subjects to organize your study" />
        ) : (
          <div className="subject-list">
            {subjects.map((s) => (
              <div key={s._id} className="subject-item">
                <span className="subject-dot" style={{ background: s.color }} />
                <span className="subject-name">{s.name}</span>
                <span className="subject-time">{formatMinutes(s.totalMinutes)}</span>
                <button onClick={() => handleDeleteSubject(s._id)} className="subject-delete"><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal open={sessionModal} onClose={() => setSessionModal(false)} title="Log Study Session">
        {error && <ErrorMsg message={error} />}
        <Select label="Subject" value={sessionForm.subjectId} onChange={(e) => setSessionForm({ ...sessionForm, subjectId: e.target.value })}>
          <option value="">General</option>
          {subjects.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
        </Select>
        <Input label="Minutes studied" type="number" min={1} value={sessionForm.minutes} onChange={(e) => setSessionForm({ ...sessionForm, minutes: e.target.value })} />
        <Input label="Notes (optional)" value={sessionForm.notes} onChange={(e) => setSessionForm({ ...sessionForm, notes: e.target.value })} />
        <div className="form-actions">
          <Button variant="ghost" onClick={() => setSessionModal(false)}>Cancel</Button>
          <Button onClick={handleLogSession} disabled={saving}>{saving ? 'Saving...' : 'Log Session'}</Button>
        </div>
      </Modal>

      <Modal open={subjectModal} onClose={() => setSubjectModal(false)} title="Add Subject">
        {error && <ErrorMsg message={error} />}
        <Input label="Subject Name" value={newSubject} onChange={(e) => setNewSubject(e.target.value)} placeholder="e.g. Mathematics" />
        <div className="form-actions">
          <Button variant="ghost" onClick={() => setSubjectModal(false)}>Cancel</Button>
          <Button onClick={handleAddSubject} disabled={saving}>Add</Button>
        </div>
      </Modal>
    </div>
  );
}
