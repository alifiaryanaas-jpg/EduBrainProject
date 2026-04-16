import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

const api = axios.create({ baseURL: BASE_URL });

// ─── Student Service ─────────────────────────────────────────────────────────
export const studentAPI = {
    getAll:    ()       => api.get('/students'),
    getById:   (id)     => api.get(`/students/${id}`),
    create:    (data)   => api.post('/students', data),
    update:    (id, data) => api.put(`/students/${id}`, data),
    delete:    (id)     => api.delete(`/students/${id}`),
};

// ─── Course Service ──────────────────────────────────────────────────────────
export const courseAPI = {
    getAll:    ()       => api.get('/courses'),
    getById:   (id)     => api.get(`/courses/${id}`),
    create:    (data)   => api.post('/courses', data),
    update:    (id, data) => api.put(`/courses/${id}`, data),
    delete:    (id)     => api.delete(`/courses/${id}`),
};

// ─── Enrollment Service ──────────────────────────────────────────────────────
export const enrollmentAPI = {
    getAll:          ()          => api.get('/enrollments'),
    getByStudent:    (studentId) => api.get(`/enrollments/student/${studentId}`),
    getByCourse:     (courseId)  => api.get(`/enrollments/course/${courseId}`),
    create:          (data)      => api.post('/enrollments', data),
    update:          (id, data)  => api.put(`/enrollments/${id}`, data),
    delete:          (id)        => api.delete(`/enrollments/${id}`),
};

// ─── Attendance Service ──────────────────────────────────────────────────────
export const attendanceAPI = {
    getAll:       ()          => api.get('/attendance'),
    getByStudent: (id)        => api.get(`/attendance/student/${id}`),
    getByCourse:  (id)        => api.get(`/attendance/course/${id}`),
    create:       (data)      => api.post('/attendance', data),
    update:       (id, data)  => api.put(`/attendance/${id}`, data),
    delete:       (id)        => api.delete(`/attendance/${id}`),
};

export default api;
