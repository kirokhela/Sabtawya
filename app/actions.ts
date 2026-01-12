// File: app/actions.ts
'use server';

import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL!);

// =======================
// Users (Admin Management)
// =======================
export type User = {
  id: number;
  name: string;
  role: string;
};

export async function loginAction(
  name: string,
  password: string
): Promise<User | null> {
  const users = (await sql`
    SELECT id, name, role
    FROM users
    WHERE name = ${name}
      AND password = ${password}
    LIMIT 1
  `) as User[];
  return users[0] ?? null;
}

export async function getUsers() {
  return (await sql`
    SELECT id, name, role
    FROM users
    ORDER BY id ASC
  `) as User[];
}

export async function createUser(formData: FormData) {
  const name = formData.get('name') as string;
  const password = formData.get('password') as string;
  const role = formData.get('role') as string;

  await sql`
    INSERT INTO users (name, password, role)
    VALUES (${name}, ${password}, ${role})
  `;
}

export async function updateUser(id: number, formData: FormData) {
  const name = formData.get('name') as string;
  const password = formData.get('password') as string;
  const role = formData.get('role') as string;

  await sql`
    UPDATE users
    SET name = ${name}, password = ${password}, role = ${role}
    WHERE id = ${id}
  `;
}

export async function deleteUser(id: number) {
  await sql`
    DELETE FROM users
    WHERE id = ${id}
  `;
}

// =======================
// Classes
// =======================
export type Class = {
  class_id: number;
  class_name: string;
  gender: boolean;
  created_at: string;
};

export async function getClasses() {
  return (await sql`
    SELECT class_id, class_name, gender, created_at
    FROM classes
    ORDER BY class_id ASC
  `) as Class[];
}

export async function createClass(formData: FormData) {
  const class_name = formData.get('class_name') as string;
  const gender = formData.get('gender') === 'true';

  await sql`
    INSERT INTO classes (class_name, gender)
    VALUES (${class_name}, ${gender})
  `;
}

export async function updateClass(class_id: number, formData: FormData) {
  const class_name = formData.get('class_name') as string;
  const gender = formData.get('gender') === 'true';

  await sql`
    UPDATE classes
    SET class_name = ${class_name}, gender = ${gender}
    WHERE class_id = ${class_id}
  `;
}

export async function deleteClass(class_id: number) {
  await sql`
    DELETE FROM classes
    WHERE class_id = ${class_id}
  `;
}

// =======================
// Students
// =======================
export type Student = {
  student_id: number;
  name: string;
  class_id: number;
  created_at: string;
  gender: boolean;
};

export async function getStudents() {
  return (await sql`
    SELECT student_id, name, class_id, created_at, gender
    FROM students
    ORDER BY student_id ASC
  `) as Student[];
}

export async function createStudent(formData: FormData) {
  const name = formData.get('name') as string;
  const class_id = Number(formData.get('class_id'));
  const gender = formData.get('gender') === 'true';

  await sql`
    INSERT INTO students (name, class_id ,gender)
    VALUES (${name}, ${class_id}, ${gender})
  `;
}

export async function updateStudent(student_id: number, formData: FormData) {
  const name = formData.get('name') as string;
  const class_id = Number(formData.get('class_id'));
    const gender = formData.get('gender') === 'true';

  await sql`
    UPDATE students
    SET name = ${name}, class_id = ${class_id}, gender = ${gender}
    WHERE student_id = ${student_id}
  `;
}

export async function deleteStudent(student_id: number) {
  await sql`
    DELETE FROM students
    WHERE student_id = ${student_id}
  `;
}

// =======================
// Attendance
// =======================
export type Attendance = {
  attendance_id: number;
  student_id: number;
  school_day_id: number;
  attended: boolean;
  created_at: string;
  time: string; // HH:MM Cairo time
  user_id?: number;
};

export async function getAttendance(school_day_id?: string | number): Promise<Attendance[]> {
  if (school_day_id) {
    const result = await sql`
      SELECT attendance_id, student_id, school_day_id, attended, created_at, time, user_id
      FROM attendance
      WHERE school_day_id = ${school_day_id}
      ORDER BY student_id ASC
    `;
    return result.map(row => ({
      attendance_id: row.attendance_id,
      student_id: row.student_id,
      school_day_id: row.school_day_id,
      attended: row.attended,
      created_at: row.created_at,
      time: row.time,
      user_id: row.user_id,
    })) as Attendance[];
  }

  const result = await sql`
    SELECT attendance_id, student_id, school_day_id, attended, created_at, time, user_id
    FROM attendance
    ORDER BY school_day_id DESC, student_id ASC
  `;
  return result.map(row => ({
    attendance_id: row.attendance_id,
    student_id: row.student_id,
    school_day_id: row.school_day_id,
    attended: row.attended,
    created_at: row.created_at,
    time: row.time,
    user_id: row.user_id,
  })) as Attendance[];
}

export async function createAttendance(formData: FormData) {
  const student_id = Number(formData.get('student_id'));
  const school_day_id = Number(formData.get('school_day_id'));
  const attended = formData.get('attended') === 'true';
  const time = formData.get('time') as string;
  const user_id = formData.get('user_id') ? Number(formData.get('user_id')) : "1";

  await sql`
    INSERT INTO attendance (student_id, school_day_id, attended, time, user_id)
    VALUES (${student_id}, ${school_day_id}, ${attended}, ${time}, ${user_id})
  `;
}

export async function updateAttendance(attendance_id: number, formData: FormData) {
  const student_id = Number(formData.get('student_id'));
  const school_day_id = Number(formData.get('school_day_id'));
  const attended = formData.get('attended') === 'true';
  const time = formData.get('time') as string;

  const user_id = formData.get('user_id') ? Number(formData.get('user_id')) : "1";

  await sql`
    UPDATE attendance
    SET student_id = ${student_id}, school_day_id = ${school_day_id}, attended = ${attended}, time = ${time}, user_id = ${user_id}
    WHERE attendance_id = ${attendance_id}
  `;
}

export async function deleteAttendance(attendance_id: number) {
  await sql`
    DELETE FROM attendance
    WHERE attendance_id = ${attendance_id}
  `;
}

// =======================
// School Day Type
// =======================
export type SchoolDay = {
  school_day_id: number;
  school_date: string; // YYYY-MM-DD
  created_at: string;
};

// Get all school days
export async function getSchoolDays(): Promise<SchoolDay[]> {
  const result = await sql`
    SELECT school_day_id, school_date, created_at
    FROM school_days
    ORDER BY school_date ASC
  `;
  return result.map(row => ({
    school_day_id: row.school_day_id,
    school_date: row.school_date,
    created_at: row.created_at,
  })) as SchoolDay[];
}

// Create a new school day
export async function createSchoolDay(date: string) {
  await sql`
    INSERT INTO school_days (day_date)
    VALUES (${date})
  `;
}

// Update an existing school day
export async function updateSchoolDay(day_id: number, newDate: string) {
  await sql`
    UPDATE school_days
    SET day_date = ${newDate}
    WHERE day_id = ${day_id}
  `;
}

// Delete a school day
export async function deleteSchoolDay(day_id: number) {
  await sql`
    DELETE FROM school_days
    WHERE day_id = ${day_id}
  `;
}

