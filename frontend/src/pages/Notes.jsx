import { useEffect, useState } from 'react';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { api } from '../api';
import { NOTE_COLORS } from '../utils';
import {
  PageHeader, Button, Card, Modal, Input, Textarea, Loading, EmptyState, ErrorMsg,
} from '../components/UI';
import './Notes.css';

const EMPTY = { title: '', content: '', color: NOTE_COLORS[0] };

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');

  const load = () => {
    api.getNotes()
      .then(setNotes)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm(EMPTY); setModal(true); setError(''); };
  const openEdit = (note) => {
    setEditing(note);
    setForm({ title: note.title, content: note.content, color: note.color });
    setModal(true);
    setError('');
  };

  const handleSave = async () => {
    if (!form.title.trim()) { setError('Enter a note title'); return; }
    try {
      if (editing) {
        await api.updateNote(editing._id, form);
      } else {
        await api.createNote(form);
      }
      setModal(false);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this note?')) return;
    await api.deleteNote(id);
    load();
  };

  if (loading) return <Loading />;

  return (
    <div>
      <PageHeader
        title="Quick Notes"
        subtitle="Save important study information"
        action={<Button onClick={openAdd}><Plus size={18} /> New Note</Button>}
      />

      {notes.length === 0 ? (
        <Card>
          <EmptyState icon="📝" title="No notes yet" subtitle="Jot down key concepts, formulas, or reminders" />
          <div style={{ textAlign: 'center' }}>
            <Button onClick={openAdd}><Plus size={18} /> Create Note</Button>
          </div>
        </Card>
      ) : (
        <div className="notes-grid">
          {notes.map((n) => (
            <div key={n._id} className="note-card" style={{ background: n.color }}>
              <div className="note-header">
                <h3>{n.title}</h3>
                <div className="note-actions">
                  <button onClick={() => openEdit(n)} aria-label="Edit"><Pencil size={14} /></button>
                  <button onClick={() => handleDelete(n._id)} aria-label="Delete"><Trash2 size={14} /></button>
                </div>
              </div>
              <p className="note-content">{n.content || 'No content'}</p>
              <div className="note-date">
                {new Date(n.updatedAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Note' : 'New Note'}>
        {error && <ErrorMsg message={error} />}
        <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Note title" />
        <Textarea label="Content" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Write your notes here..." />
        <label className="input-group">
          <span className="input-label">Color</span>
          <div className="color-picker">
            {NOTE_COLORS.map((c) => (
              <button
                key={c}
                className={`color-swatch ${form.color === c ? 'selected' : ''}`}
                style={{ background: c }}
                onClick={() => setForm({ ...form, color: c })}
                type="button"
              />
            ))}
          </div>
        </label>
        <div className="form-actions">
          <Button variant="ghost" onClick={() => setModal(false)}>Cancel</Button>
          <Button onClick={handleSave}>{editing ? 'Update' : 'Save'}</Button>
        </div>
      </Modal>
    </div>
  );
}
