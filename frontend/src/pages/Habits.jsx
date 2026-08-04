import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import {
  PageHeader, Button, Card, Modal, Input, Loading, EmptyState, ErrorMsg,
} from '../components/UI';
import './Habits.css';

export default function Habits() {
  const { refreshUser } = useAuth();
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('✅');
  const [error, setError] = useState('');

  const load = () => {
    api.getHabits()
      .then(setHabits)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleToggle = async (id) => {
    await api.toggleHabit(id);
    load();
    refreshUser();
  };

  const handleAdd = async () => {
    if (!name.trim()) { setError('Enter habit name'); return; }
    try {
      await api.createHabit({ name, icon });
      setModal(false);
      setName('');
      setIcon('✅');
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this habit?')) return;
    await api.deleteHabit(id);
    load();
  };

  const doneCount = habits.filter((h) => h.doneToday).length;

  if (loading) return <Loading />;

  return (
    <div>
      <PageHeader
        title="Habit Tracker"
        subtitle={`${doneCount} of ${habits.length} habits done today`}
        action={<Button onClick={() => { setModal(true); setError(''); }}><Plus size={18} /> Add Habit</Button>}
      />

      {habits.length === 0 ? (
        <Card><EmptyState icon="🔥" title="No habits yet" subtitle="Build good routines one day at a time" /></Card>
      ) : (
        <div className="habit-grid">
          {habits.map((h) => (
            <Card key={h._id} className={`habit-card ${h.doneToday ? 'done' : ''}`}>
              <button className="habit-toggle" onClick={() => handleToggle(h._id)}>
                <span className="habit-icon">{h.icon}</span>
                <span className={`habit-check ${h.doneToday ? 'checked' : ''}`}>
                  {h.doneToday ? '✓' : ''}
                </span>
              </button>
              <div className="habit-info">
                <div className="habit-name">{h.name}</div>
                <div className="habit-streak">🔥 {h.streak} day streak · Best: {h.bestStreak}</div>
              </div>
              <button className="habit-delete" onClick={() => handleDelete(h._id)} aria-label="Delete">
                <Trash2 size={15} />
              </button>
            </Card>
          ))}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title="New Habit">
        {error && <ErrorMsg message={error} />}
        <Input label="Habit Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Drink water" />
        <Input label="Icon (emoji)" value={icon} onChange={(e) => setIcon(e.target.value)} maxLength={2} />
        <div className="form-actions">
          <Button variant="ghost" onClick={() => setModal(false)}>Cancel</Button>
          <Button onClick={handleAdd}>Add Habit</Button>
        </div>
      </Modal>
    </div>
  );
}
