-- ============================================================
-- EduBrain Online Learning Platform - Database Schema
-- ============================================================

CREATE DATABASE IF NOT EXISTS edubrain;
USE edubrain;

-- ============================================================
-- Students Table
-- ============================================================
CREATE TABLE IF NOT EXISTS students (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100)        NOT NULL,
    email       VARCHAR(150)        NOT NULL UNIQUE,
    phone       VARCHAR(20),
    address     TEXT,
    created_at  TIMESTAMP           DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP           DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================================
-- Courses Table
-- ============================================================
CREATE TABLE IF NOT EXISTS courses (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    title       VARCHAR(150)        NOT NULL,
    description TEXT,
    instructor  VARCHAR(100),
    credits     INT                 DEFAULT 3,
    created_at  TIMESTAMP           DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP           DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================================
-- Enrollments Table
-- ============================================================
CREATE TABLE IF NOT EXISTS enrollments (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    student_id  INT                 NOT NULL,
    course_id   INT                 NOT NULL,
    status      ENUM('active','completed','dropped') DEFAULT 'active',
    enrolled_at TIMESTAMP           DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP           DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id)  REFERENCES courses(id)  ON DELETE CASCADE,
    UNIQUE KEY uq_enrollment (student_id, course_id)
);

-- ============================================================
-- Attendance Table
-- ============================================================
CREATE TABLE IF NOT EXISTS attendance (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    student_id  INT                 NOT NULL,
    course_id   INT                 NOT NULL,
    date        DATE                NOT NULL,
    status      ENUM('present','absent','late') DEFAULT 'present',
    notes       TEXT,
    created_at  TIMESTAMP           DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP           DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id)  REFERENCES courses(id)  ON DELETE CASCADE
);

-- ============================================================
-- Seed Data
-- ============================================================

INSERT INTO students (name, email, phone, address) VALUES
('Fasya Arinal Hudha',       'fasya@edubrain.id',   '081200000001', 'Bandung'),
('Alifia Ryana Saputri',     'alifia@edubrain.id',  '081200000002', 'Bandung'),
('Asyifa Indi Azalia',       'asyifa@edubrain.id',  '081200000003', 'Bandung'),
('Maya Radina Putri',        'maya@edubrain.id',    '081200000004', 'Bandung'),
('Nadila Naurah Rayyani H.', 'nadila@edubrain.id',  '081200000005', 'Bandung'),
('Budi Santoso',             'budi@edubrain.id',    '081200000006', 'Jakarta'),
('Citra Dewi',               'citra@edubrain.id',   '081200000007', 'Surabaya');

INSERT INTO courses (title, description, instructor, credits) VALUES
('Web Programming',        'Learn HTML, CSS, JS, React, and Node.js',          'Dr. Ahmad',     3),
('Database Systems',       'Relational databases, SQL, and NoSQL fundamentals', 'Dr. Budi',      3),
('Computer Networks',      'TCP/IP, HTTP, DNS, and network protocols',          'Dr. Citra',     2),
('Software Engineering',   'SDLC, Agile, Scrum, and design patterns',           'Dr. Diana',     3),
('Mobile Development',     'Android and iOS development fundamentals',           'Dr. Eko',       3);

INSERT INTO enrollments (student_id, course_id, status) VALUES
(1, 1, 'active'), (1, 2, 'active'), (1, 4, 'active'),
(2, 1, 'active'), (2, 3, 'active'),
(3, 2, 'active'), (3, 4, 'active'),
(4, 1, 'active'), (4, 5, 'active'),
(5, 3, 'active'), (5, 4, 'active'),
(6, 1, 'completed'), (6, 2, 'completed'),
(7, 5, 'active');

INSERT INTO attendance (student_id, course_id, date, status) VALUES
(1, 1, '2026-04-01', 'present'),
(1, 1, '2026-04-08', 'present'),
(1, 1, '2026-04-15', 'late'),
(2, 1, '2026-04-01', 'present'),
(2, 1, '2026-04-08', 'absent'),
(3, 2, '2026-04-02', 'present'),
(3, 2, '2026-04-09', 'present'),
(4, 1, '2026-04-01', 'present'),
(5, 3, '2026-04-03', 'present'),
(5, 4, '2026-04-04', 'absent');
