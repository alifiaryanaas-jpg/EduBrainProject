import { useEffect, useState } from 'react';
import { courseAPI } from '../api/api';
import { useToast, ToastContainer } from '../hooks/useToast';

const EMPTY = { title: '', description: '', instructor: '', credits: 3 };

export default function Courses({ setTitle }) {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [modal, setModal] = useState(false);
    const [form, setForm] = useState(EMPTY);
    const [editId, setEditId] = useState(null);
    const [saving, setSaving] = useState(false);
    const { toasts, addToast } = useToast();

    const load = () => {
        setLoading(true);
        courseAPI.getAll()
            .then(r => setCourses(r.data.data))
            .catch(() => addToast('Failed to load courses', 'error'))
            .finally(() => setLoading(false));
    };

    useEffect(() => { setTitle('Courses'); load(); }, []);

    const filtered = courses.filter(c =>
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        (c.instructor || '').toLowerCase().includes(search.toLowerCase())
    );

    const openAdd = () => { setForm(EMPTY); setEditId(null); setModal(true); };
    const openEdit = (c) => { setForm({ title: c.title, description: c.description || '', instructor: c.instructor || '', credits: c.credits }); setEditId(c.id); setModal(true); };
    const closeModal = () => { setModal(false); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editId) {
                await courseAPI.update(editId, form);
                addToast('Course updated successfully');
            } else {
                await courseAPI.create(form);
                addToast('Course added successfully');
            }
            closeModal();
            load();
        } catch (err) {
            addToast(err.response?.data?.message || 'Error saving course', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id, title) => {
        if (!confirm(`Delete "${title}"?`)) return;
        try {
            await courseAPI.delete(id);
            addToast('Course deleted');
            load();
        } catch (err) {
            addToast('Failed to delete course', 'error');
        }
    };

    return (
        <>
            <div className="section-header">
                <div>
                    <h2>📚 Course Management</h2>
                    <p>Add, edit, and manage available courses</p>
                </div>
                <button className="btn btn-primary" onClick={openAdd}>+ Add Course</button>
            </div>

            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', marginBottom: 24 }}>
                <div className="stat-card">
                    <div className="stat-card-icon" style={{ background: '#06b6d422', color: '#06b6d4' }}>📚</div>
                    <div className="stat-card-count">{courses.length}</div>
                    <div className="stat-card-label">Total Courses</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-icon" style={{ background: '#6366f122', color: '#6366f1' }}>⭐</div>
                    <div className="stat-card-count">{courses.reduce((s, c) => s + (c.credits || 0), 0)}</div>
                    <div className="stat-card-label">Total Credits</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-icon" style={{ background: '#10b98122', color: '#10b981' }}>👨‍🏫</div>
                    <div className="stat-card-count">{new Set(courses.map(c => c.instructor).filter(Boolean)).size}</div>
                    <div className="stat-card-label">Instructors</div>
                </div>
            </div>

            <div className="table-wrapper">
                <div className="table-search-bar">
                    <input className="search-input" placeholder="🔍 Search by title or instructor…" value={search} onChange={e => setSearch(e.target.value)} />
                    <span style={{ fontSize: 13, color: 'var(--text-dim)' }}>{filtered.length} courses</span>
                </div>

                {loading ? (
                    <div className="spinner-wrapper"><div className="spinner" /></div>
                ) : filtered.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📚</div>
                        <h3>No courses found</h3>
                        <p>Add your first course to get started.</p>
                    </div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Course Title</th>
                                <th>Instructor</th>
                                <th>Credits</th>
                                <th>Description</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((c, i) => (
                                <tr key={c.id}>
                                    <td style={{ color: 'var(--text-dim)' }}>{i + 1}</td>
                                    <td><strong>{c.title}</strong></td>
                                    <td style={{ color: 'var(--text-muted)' }}>{c.instructor || '—'}</td>
                                    <td>
                                        <span className="badge badge-active">{c.credits} SKS</span>
                                    </td>
                                    <td style={{ color: 'var(--text-muted)', fontSize: 13, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {c.description || '—'}
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            <button className="btn btn-secondary btn-sm" onClick={() => openEdit(c)}>✏️ Edit</button>
                                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id, c.title)}>🗑️ Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {modal && (
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
                    <div className="modal">
                        <div className="modal-header">
                            <h3>{editId ? '✏️ Edit Course' : '+ Add Course'}</h3>
                            <button className="modal-close" onClick={closeModal}>✕</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Course Title *</label>
                                    <input className="form-control" required placeholder="e.g. Web Programming" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Instructor</label>
                                        <input className="form-control" placeholder="Dr. Ahmad" value={form.instructor} onChange={e => setForm({ ...form, instructor: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label>Credits (SKS)</label>
                                        <input className="form-control" type="number" min={1} max={6} value={form.credits} onChange={e => setForm({ ...form, credits: +e.target.value })} />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea className="form-control" rows={3} placeholder="Course description…" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={saving}>
                                    {saving ? 'Saving…' : editId ? 'Save Changes' : 'Add Course'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ToastContainer toasts={toasts} />
        </>
    );
}
