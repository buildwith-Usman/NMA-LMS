-- ============================================================
-- NMA LMS Migration — add columns for enhanced modules
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. assignments: instructions, total_marks, file_name
ALTER TABLE assignments
  ADD COLUMN IF NOT EXISTS instructions  TEXT    DEFAULT '',
  ADD COLUMN IF NOT EXISTS total_marks   INTEGER DEFAULT 100,
  ADD COLUMN IF NOT EXISTS file_name     TEXT;

-- 2. assignment_submissions: text (online submission)
ALTER TABLE assignment_submissions
  ADD COLUMN IF NOT EXISTS text TEXT DEFAULT '';

-- 3. notifications: module (click-to-navigate routing)
ALTER TABLE notifications
  ADD COLUMN IF NOT EXISTS module TEXT;

-- 4. quizzes: assessment_type, total_marks, passing_marks, instructions
ALTER TABLE quizzes
  ADD COLUMN IF NOT EXISTS assessment_type TEXT    DEFAULT 'quiz',
  ADD COLUMN IF NOT EXISTS total_marks     INTEGER DEFAULT 100,
  ADD COLUMN IF NOT EXISTS passing_marks   INTEGER DEFAULT 50,
  ADD COLUMN IF NOT EXISTS instructions    TEXT    DEFAULT '';

-- 5. quiz_questions: question_type (mcq, true_false, essay, etc.)
ALTER TABLE quiz_questions
  ADD COLUMN IF NOT EXISTS question_type TEXT DEFAULT 'mcq';

-- 6. quiz_submissions: text_answers (subjective), has_subjective flag
ALTER TABLE quiz_submissions
  ADD COLUMN IF NOT EXISTS text_answers   JSONB   DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS has_subjective BOOLEAN DEFAULT false;

-- 7. reports: status, feedback, to_role
ALTER TABLE reports
  ADD COLUMN IF NOT EXISTS status   TEXT DEFAULT 'received',
  ADD COLUMN IF NOT EXISTS feedback TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS to_role  TEXT DEFAULT '';

-- 8. tasks: created_by, created_by_role (track who assigned the task)
ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS created_by      TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS created_by_role TEXT DEFAULT '';

-- 9. results: academic result per student per course
CREATE TABLE IF NOT EXISTS results (
  id               SERIAL PRIMARY KEY,
  student_id       INTEGER REFERENCES students(id) ON DELETE CASCADE,
  student_name     TEXT    NOT NULL DEFAULT '',
  course_id        INTEGER REFERENCES courses(id) ON DELETE CASCADE,
  course_name      TEXT    NOT NULL DEFAULT '',
  instructor_id    INTEGER REFERENCES instructors(id) ON DELETE SET NULL,
  assignment_marks NUMERIC NOT NULL DEFAULT 0,
  quiz_marks       NUMERIC NOT NULL DEFAULT 0,
  exam_marks       NUMERIC NOT NULL DEFAULT 0,
  exam_total       NUMERIC NOT NULL DEFAULT 100,
  total_marks      NUMERIC NOT NULL DEFAULT 0,
  grand_total      NUMERIC NOT NULL DEFAULT 300,
  percentage       NUMERIC NOT NULL DEFAULT 0,
  grade            TEXT    NOT NULL DEFAULT '',
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, course_id)
);

-- Allow anon + authenticated roles full access (matches other tables in this project)
ALTER TABLE results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "results_anon_select"  ON results FOR SELECT USING (true);
CREATE POLICY "results_anon_insert"  ON results FOR INSERT WITH CHECK (true);
CREATE POLICY "results_anon_update"  ON results FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "results_anon_delete"  ON results FOR DELETE USING (true);
