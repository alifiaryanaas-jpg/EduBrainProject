import { useEffect, useState } from 'react';
import { studentAPI, courseAPI, enrollmentAPI, attendanceAPI } from '../api/api';

const CARDS = [
    { label: 'Total Students', icon: '👤', color: '#6366f1', api: studentAPI.getAll },
    { label: 'Total Courses',  icon: '📚', color: '#06b6d4', api: courseAPI.getAll },
    { label: 'Enrollments',    icon: '🎓', color: '#10b981', api: enrollmentAPI.getAll },
    { label: 'Attendance Logs',icon: '✅', color: '#f59e0b', api: attendanceAPI.getAll },
];

export default function Dashboard({ setTitle }) {
    const [counts, setCounts] = useState([0, 0, 0, 0]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setTitle('Dashboard');
        Promise.all(CARDS.map(c => c.api().catch(() => ({ data: { data: [] } })))).then(results => {
            setCounts(results.map(r => (r.data?.data || []).length));
            setLoading(false);
        });
    }, []);

    return (
        <>
            <div className="welcome-banner">
                <h2>Welcome to EduBrain 🧠</h2>
                <p>Online Learning Platform — Group 5 · IAE Semester 4 · Telkom University</p>
            </div>

            <div className="stats-grid">
                {CARDS.map((c, i) => (
                    <div className="stat-card" key={c.label} style={{ '--accent': c.color }}>
                        <div className="stat-card-icon" style={{ background: c.color + '22', color: c.color }}>
                            {c.icon}
                        </div>
                        <div className="stat-card-count">{loading ? '—' : counts[i]}</div>
                        <div className="stat-card-label">{c.label}</div>
                    </div>
                ))}
            </div>

            <div className="table-wrapper">
                <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700 }}>📡 API Endpoints</h3>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                        Microservices running at <code style={{ color: 'var(--primary-light)' }}>http://localhost:5000</code>
                    </p>
                </div>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Service</th>
                            <th>Method</th>
                            <th>Endpoint</th>
                            <th>Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[
                            ['Student', 'GET',    '/api/students',                      'Get all students'],
                            ['Student', 'GET',    '/api/students/:id',                  'Get student detail'],
                            ['Student', 'POST',   '/api/students',                      'Register student'],
                            ['Student', 'PUT',    '/api/students/:id',                  'Update student'],
                            ['Student', 'DELETE', '/api/students/:id',                  'Remove student'],
                            ['Course',  'GET',    '/api/courses',                       'Display courses'],
                            ['Course',  'POST',   '/api/courses',                       'Add course'],
                            ['Course',  'PUT',    '/api/courses/:id',                   'Edit course'],
                            ['Course',  'DELETE', '/api/courses/:id',                   'Delete course'],
                            ['Enrollment','POST', '/api/enrollments',                   'Enroll student'],
                            ['Enrollment','GET',  '/api/enrollments/student/:studentId','Get student courses'],
                            ['Enrollment','GET',  '/api/enrollments/course/:courseId',  'Get participants'],
                            ['Enrollment','PUT',  '/api/enrollments/:id',               'Update enrollment'],
                            ['Enrollment','DELETE','/api/enrollments/:id',              'Remove enrollment'],
                            ['Attendance','GET',  '/api/attendance',                    'Get all attendance'],
                            ['Attendance','GET',  '/api/attendance/student/:id',        'By student'],
                            ['Attendance','GET',  '/api/attendance/course/:id',         'By course'],
                            ['Attendance','POST', '/api/attendance',                    'Mark attendance'],
                            ['Attendance','PUT',  '/api/attendance/:id',                'Update record'],
                            ['Attendance','DELETE','/api/attendance/:id',               'Delete record'],
                        ].map(([svc, method, ep, desc], i) => (
                            <tr key={i}>
                                <td><span className={`badge badge-${svc === 'Student' ? 'active' : svc === 'Course' ? 'completed' : svc === 'Enrollment' ? 'late' : 'present'}`}>{svc}</span></td>
                                <td><code style={{ fontSize: 12, color: method === 'GET' ? '#10b981' : method === 'POST' ? '#6366f1' : method === 'PUT' ? '#f59e0b' : '#ef4444' }}>{method}</code></td>
                                <td><code style={{ fontSize: 12, color: 'var(--text-muted)' }}>{ep}</code></td>
                                <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{desc}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}
