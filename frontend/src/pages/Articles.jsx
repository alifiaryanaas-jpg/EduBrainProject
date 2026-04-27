import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast, ToastContainer } from '../hooks/useToast';
import api from '../api/api';

export default function Articles({ setTitle }) {
    const { user, isAdmin } = useAuth();
    const { toasts, addToast } = useToast();

    const [articles, setArticles] = useState([]);
    const [courses,  setCourses]  = useState([]);
    const [loading,  setLoading]  = useState(true);
    const [reading,  setReading]  = useState(null); 
    const [modal,    setModal]    = useState(false); 
    const [editId,   setEditId]   = useState(null);
    const [form,     setForm]     = useState({ title: '', content: '', course_id: '' });
    const [saving,   setSaving]   = useState(false);
    const [readTimer, setReadTimer] = useState(0);   
    const [canMark,  setCanMark]  = useState(false); 

    const load = () => {
        setLoading(true);
        Promise.all([
            api.get('/articles'),
            api.get('/courses'),
        ])
            .then(([a, c]) => {
                setArticles(a.data.data);
                setCourses(c.data.data);
            })
            .catch(() => addToast('Failed to load articles', 'error'))
            .finally(() => setLoading(false));
    };

    useEffect(() => { setTitle('Articles'); load(); }, []);

    // --- Timer Logic ---
    useEffect(() => {
        if (!reading || isAdmin || reading.is_read) return;

        // Reset timer cuma kalau artikelnya belum pernah dibaca
        setReadTimer(0);
        setCanMark(false);

        const interval = setInterval(() => {
            setReadTimer(t => {
                const next = t + 1;
                if (next >= 10) {
                    setCanMark(true);
                    clearInterval(interval);
                }
                return next;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [reading, isAdmin]);

    const openRead = (article) => {
        setReading(article);
        // Kalau sudah pernah dibaca, tombol mark as read langsung aktif
        if (article.is_read) {
            setCanMark(true);
        }
    };

    const markAsRead = async () => {
        if (!reading || reading.is_read) return;
        try {
            await api.post(`/articles/${reading.id}/read`);
            addToast('✅ Article marked as read!');
            setReading(null);
            load(); 
        } catch (err) {
            addToast(err.response?.data?.message || 'Failed to mark as read', 'error');
        }
    };

    // --- Markdown Renderer Helper ---
    const renderContent = (content) => {
        return content.split('\n').map((line, i) => {
            if (!line.trim()) return <br key={i} />;
            
            // Detect Headers
            if (line.match(/^#\s/)) return <h1 key={i} style={{marginTop: '1.5rem'}}>{line.replace(/^#\s/, '')}</h1>;
            if (line.match(/^##\s/)) return <h2 key={i} style={{marginTop: '1.2rem'}}>{line.replace(/^##\s/, '')}</h2>;
            
            // Detect Bold (inline replacement)
            const formattedLine = line.split(/(\*\*.*?\*\*)/g).map((part, index) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={index}>{part.slice(2, -2)}</strong>;
                }
                return part;
            });

            return <p key={i} style={{marginBottom: '0.8rem', lineHeight: '1.6'}}>{formattedLine}</p>;
        });
    };

    // Admin CRUD
    const openCreate = () => { setForm({ title: '', content: '', course_id: '' }); setEditId(null); setModal(true); };
    const openEdit   = (a) => { setForm({ title: a.title, content: a.content, course_id: a.course_id || '' }); setEditId(a.id); setModal(true); };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = { ...form, course_id: form.course_id || null };
            if (editId) {
                await api.put(`/articles/${editId}`, payload);
                addToast('Article updated successfully');
            } else {
                await api.post('/articles', payload);
                addToast('Article created successfully');
            }
            setModal(false);
            load();
        } catch (err) {
            addToast(err.response?.data?.message || 'Save failed', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this article?')) return;
        try {
            await api.delete(`/articles/${id}`);
            addToast('Article deleted');
            load();
        } catch { addToast('Delete failed', 'error'); }
    };

    const courseTitle = (id) => courses.find(c => c.id == id)?.title || 'General';

    return (
        <>
            <div className="section-header">
                <div>
                    <h2>📰 Articles</h2>
                    <p>{isAdmin ? 'Manage learning articles' : 'Read articles to unlock course attendance'}</p>
                </div>
                {isAdmin && <button className="btn btn-primary" onClick={openCreate}>+ New Article</button>}
            </div>

            {loading ? (
                <div className="spinner-wrapper"><div className="spinner" /></div>
            ) : articles.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">📰</div>
                    <h3>No articles available</h3>
                    <p>Check back later for new learning materials.</p>
                </div>
            ) : (
                <div className="articles-grid">
                    {articles.map(a => (
                        <div key={a.id} className={`article-card ${a.is_read ? 'read' : ''}`}>
                            <div className="article-card-meta">
                                <span className="article-course-badge">{courseTitle(a.course_id)}</span>
                                {!isAdmin && (
                                    <span className={`badge ${a.is_read ? 'badge-active' : 'badge-dropped'}`}>
                                        {a.is_read ? '✅ Read' : '📖 Unread'}
                                    </span>
                                )}
                            </div>
                            <h3 className="article-card-title">{a.title}</h3>
                            <p className="article-card-preview">
                                {a.content.replace(/[#*`]/g, '').slice(0, 120)}…
                            </p>
                            <div className="article-card-actions">
                                <button className="btn btn-secondary btn-sm" onClick={() => openRead(a)}>
                                    {a.is_read ? '👁️ View' : '📖 Read'}
                                </button>
                                {isAdmin && (
                                    <>
                                        <button className="btn btn-secondary btn-sm" onClick={() => openEdit(a)}>✏️</button>
                                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(a.id)}>🗑️</button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ── Reader Modal ── */}
            {reading && (
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setReading(null)}>
                    <div className="modal modal-reader">
                        <div className="modal-header">
                            <h3>{reading.title}</h3>
                            <button className="modal-close" onClick={() => setReading(null)}>✕</button>
                        </div>
                        <div className="modal-body reader-body">
                            <div className="article-course-badge" style={{ marginBottom: 16 }}>
                                {courseTitle(reading.course_id)}
                            </div>
                            <div className="article-content">
                                {renderContent(reading.content)}
                            </div>
                        </div>
                        <div className="modal-footer" style={{ flexDirection: 'column', gap: 12 }}>
                            {!isAdmin && (
                                <>
                                    {!reading.is_read && (
                                        <div className="read-timer-bar">
                                            <div className="read-timer-fill" style={{ width: `${Math.min(readTimer / 10 * 100, 100)}%` }} />
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', gap: 8, width: '100%' }}>
                                        <button className="btn btn-secondary" onClick={() => setReading(null)}>Close</button>
                                        {reading.is_read ? (
                                            <button className="btn btn-primary" disabled style={{ flex: 1 }}>✅ Completed</button>
                                        ) : (
                                            <button
                                                className="btn btn-primary"
                                                style={{ flex: 1 }}
                                                disabled={!canMark}
                                                onClick={markAsRead}
                                            >
                                                {canMark ? '✅ Mark as Read' : `Reading... (${10 - readTimer}s)`}
                                            </button>
                                        )}
                                    </div>
                                </>
                            )}
                            {isAdmin && <button className="btn btn-secondary" style={{width: '100%'}} onClick={() => setReading(null)}>Close</button>}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Admin Modal ── */}
            {modal && (
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
                    <div className="modal">
                        <div className="modal-header">
                            <h3>{editId ? '✏️ Edit Article' : '+ New Article'}</h3>
                            <button className="modal-close" onClick={() => setModal(false)}>✕</button>
                        </div>
                        <form onSubmit={handleSave}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Title *</label>
                                    <input className="form-control" required value={form.title}
                                        onChange={e => setForm({ ...form, title: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Course</label>
                                    <select className="form-control" value={form.course_id}
                                        onChange={e => setForm({ ...form, course_id: e.target.value })}>
                                        <option value="">-- General (No Course) --</option>
                                        {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Content * (Markdown: # H1, ## H2, **bold**)</label>
                                    <textarea className="form-control" rows={12} required value={form.content}
                                        onChange={e => setForm({ ...form, content: e.target.value })}
                                        style={{ resize: 'vertical', fontFamily: 'monospace' }} />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={saving}>
                                    {saving ? 'Processing…' : editId ? 'Update' : 'Create'}
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