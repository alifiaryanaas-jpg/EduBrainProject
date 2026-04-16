import { useEffect, useState } from 'react';
import { enrollmentAPI, studentAPI, courseAPI } from '../api/api';
import { useToast, ToastContainer } from '../hooks/useToast';

const STATUS_OPTIONS = ['active', 'completed', 'dropped'];

export default function Enrollments({ setTitle }) {
    const [enrollments, setEnrollments] = useState([]);
    const [students, setStudents] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [modal, setModal] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState({ student_id: '', course_id: '', status: 'active' });
    const [saving, setSaving] = useState(false);
    const { toasts, addToast } = useToast();

    const load = () => {
        setLoading(true);
        Promise.all([enrollmentAPI.getAll(), studentAPI.getAll(), courseAPI.getAll()])
            .then(([e, s, c]) => {
                setEnrollments(e.data.data);
                setStudents(s.data.data);
                setCourses(c.data.data);
            })
            .catch(() => addToast('Failed to load data', 'error'))
            .finally(() => setLoading(false));
    };

    useEffect(() => { setTitle('Enrollments'); load(); }, []);

    const filtered = enrollments.filter(e =>
        (e.student_name || '').toLowerCase().includes(search.toLowerCase()) ||
        (e.course_title || '').toLowerCase().includes(search.toLowerCase())
    );

    const openAdd = () => { setForm({ student_id: '', course_id: '', status: 'active' }); setEditId(null); setModal(true); };
    const openEdit = (e) => { setForm({ student_id: e.student_id, course_id: e.course_id, status: e.status }); setEditId(e.id); setModal(true); };
    const closeModal = () => setModal(false);

    const handleSubmit = async (ev) => {
        ev.preventDefault();
        setSaving(true);
        try {
            if (editId) {
                await enrollmentAPI.update(editId, { status: form.status });
                addToast('Enrollment updated');
            } else {
                await enrollmentAPI.create(form);
                addToast('Student enrolled successfully');
            }
            closeModal();
            load();
        } catch (err) {
            addToast(err.response?.data?.message || 'Error saving enrollment', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Remove this enrollment?')) return;
        try {
            await enrollmentAPI.delete(id);
            addToast('Enrollment removed');
            load();
        } catch {
            addToast('Failed to remove enrollment', 'error');
        }
    };

    const countByStatus = (s) => enrollments.filter(e => e.status === s).length;

    return (
        <>
            <div className="section-header">
                <div>
                    <h2>🎓 Enrollment Management</h2>
                    <p>Enroll students to courses and track their status</p>
                </div>
                <button className="btn btn-primary" onClick={openAdd}>+ Enroll Student</button>
            </div>

            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', marginBottom: 24 }}>
                <div className="stat-card">
                    <div className="stat-card-icon" style={{ background: '#6366f122', color: '#6366f1' }}>📋</div>
                    <div className="stat-card-count">{enrollments.length}</div>
                    <div className="stat-card-label">Total Enrollments</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-icon" style={{ background: '#10b98122', color: '#10b981' }}>✅</div>
                    <div className="stat-card-count">{countByStatus('active')}</div>
                    <div className="stat-card-label">Active</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-icon" style={{ background: '#818cf822', color: '#818cf8' }}>🏁</div>
                    <div className="stat-card-count">{countByStatus('completed')}</div>
                    <div className="stat-card-label">Completed</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-icon" style={{ background: '#ef444422', color: '#ef4444' }}>❌</div>
                    <div className="stat-card-count">{countByStatus('dropped')}</div>
                    <div className="stat-card-label">Dropped</div>
                </div>
            </div>

            <div className="table-wrapper">
                <div className="table-search-bar">
                    <input className="search-input" placeholder="🔍 Search by student or course…" value={search} onChange={e => setSearch(e.target.value)} />
                    <span style={{ fontSize: 13, color: 'var(--text-dim)' }}>{filtered.length} records</span>
                </div>

                {loading ? (
                    <div className="spinner-wrapper"><div className="spinner" /></div>
                ) : filtered.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">🎓</div>
                        <h3>No enrollments found</h3>
                        <p>Enroll students to courses to get started.</p>
                    </div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Student</th>
                                <th>Course</th>
                                <th>Status</th>
                                <th>Enrolled At</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((e, i) => (
                                <tr key={e.id}>
                                    <td style={{ color: 'var(--text-dim)' }}>{i + 1}</td>
                                    <td><strong>{e.student_name}</strong></td>
                                    <td style={{ color: 'var(--text-muted)' }}>{e.course_title}</td>
                                    <td><span className={`badge badge-${e.status}`}>{e.status}</span></td>
                                    <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{new Date(e.enrolled_at).toLocaleDateString('id-ID')}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            <button className="btn btn-secondary btn-sm" onClick={() => openEdit(e)}>✏️ Status</button>
                                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(e.id)}>🗑️ Remove</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {modal && (
                <div className="modal-overlay" onClick={ev => ev.target === ev.currentTarget && closeModal()}>
                    <div className="modal">
                        <div className="modal-header">
                            <h3>{editId ? '✏️ Update Enrollment' : '+ Enroll Student'}</h3>
                            <button className="modal-close" onClick={closeModal}>✕</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                {!editId && (
                                    <>
                                        <div className="form-group">
                                            <label>Student *</label>
                                            <select className="form-control" required value={form.student_id} onChange={e => setForm({ ...form, student_id: e.target.value })}>
                                                <option value="">-- Select Student --</option>
                                                {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Course *</label>
                                            <select className="form-control" required value={form.course_id} onChange={e => setForm({ ...form, course_id: e.target.value })}>
                                                <option value="">-- Select Course --</option>
                                                {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                                            </select>
                                        </div>
                                    </>
                                )}
                                <div className="form-group">
                                    <label>Status</label>
                                    <select className="form-control" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={saving}>
                                    {saving ? 'Saving…' : editId ? 'Update' : 'Enroll'}
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
