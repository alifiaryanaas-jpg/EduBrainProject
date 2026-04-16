const express = require('express');
const router  = express.Router();
const db      = require('../config/db');

// GET /api/attendance — Get All Attendance records
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT a.*, s.name AS student_name, c.title AS course_title
            FROM attendance a
            JOIN students s ON a.student_id = s.id
            JOIN courses  c ON a.course_id  = c.id
            ORDER BY a.date DESC, a.created_at DESC
        `);
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// GET /api/attendance/student/:id — Get Attendance by Student
router.get('/student/:id', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT a.*, c.title AS course_title
            FROM attendance a
            JOIN courses c ON a.course_id = c.id
            WHERE a.student_id = ?
            ORDER BY a.date DESC
        `, [req.params.id]);
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// GET /api/attendance/course/:id — Get Attendance by Course
router.get('/course/:id', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT a.*, s.name AS student_name, s.email
            FROM attendance a
            JOIN students s ON a.student_id = s.id
            WHERE a.course_id = ?
            ORDER BY a.date DESC
        `, [req.params.id]);
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// POST /api/attendance — Mark Attendance
router.post('/', async (req, res) => {
    const { student_id, course_id, date, status, notes } = req.body;
    if (!student_id || !course_id || !date) {
        return res.status(400).json({ success: false, message: 'student_id, course_id, and date are required' });
    }
    try {
        const [result] = await db.query(
            'INSERT INTO attendance (student_id, course_id, date, status, notes) VALUES (?, ?, ?, ?, ?)',
            [student_id, course_id, date, status || 'present', notes || null]
        );
        const [newRecord] = await db.query(`
            SELECT a.*, s.name AS student_name, c.title AS course_title
            FROM attendance a
            JOIN students s ON a.student_id = s.id
            JOIN courses  c ON a.course_id  = c.id
            WHERE a.id = ?
        `, [result.insertId]);
        res.status(201).json({ success: true, data: newRecord[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// PUT /api/attendance/:id — Update Attendance Record
router.put('/:id', async (req, res) => {
    const { status, notes } = req.body;
    try {
        const [check] = await db.query('SELECT id FROM attendance WHERE id = ?', [req.params.id]);
        if (!check.length) return res.status(404).json({ success: false, message: 'Attendance record not found' });
        await db.query('UPDATE attendance SET status=?, notes=? WHERE id=?', [status, notes, req.params.id]);
        const [updated] = await db.query(`
            SELECT a.*, s.name AS student_name, c.title AS course_title
            FROM attendance a
            JOIN students s ON a.student_id = s.id
            JOIN courses  c ON a.course_id  = c.id
            WHERE a.id = ?
        `, [req.params.id]);
        res.json({ success: true, data: updated[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// DELETE /api/attendance/:id — Delete Attendance Record
router.delete('/:id', async (req, res) => {
    try {
        const [check] = await db.query('SELECT id FROM attendance WHERE id = ?', [req.params.id]);
        if (!check.length) return res.status(404).json({ success: false, message: 'Attendance record not found' });
        await db.query('DELETE FROM attendance WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Attendance record deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
