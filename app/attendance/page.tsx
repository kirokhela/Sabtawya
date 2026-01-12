'use client';

import { useEffect, useState } from 'react';
import type { Attendance, Class, SchoolDay, Student } from '../actions';
import {
  createAttendance,
  deleteAttendance,
  getAttendance,
  getClasses,
  getSchoolDays,
  getStudents,
  updateAttendance,
} from '../actions';
import Button from '../components/Button';


export default function AttendancePage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [schoolDays, setSchoolDays] = useState<SchoolDay[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formStudent, setFormStudent] = useState<{ student_id: number }>({ student_id: 0 });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    // Read user id from localStorage only on the client
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      setUserId(u?.id ?? null);
    } catch (err) {
      setUserId(null);
    }
  }, []);
const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleDateString('ar-EG');
};
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [studentsData, classesData, daysData] = await Promise.all([
      getStudents(),
      getClasses(),
      getSchoolDays(),
    ]);
    setStudents(studentsData);
    setClasses(classesData);
    setSchoolDays(daysData);
  };

  const fetchAttendance = async (date_id: number) => {
    const data = await getAttendance(date_id);
    setAttendance(
      data.map(item => ({
        ...item,
        time:
          item.time ||
          new Date().toLocaleTimeString('en-GB', {
            hour12: false,
            timeZone: 'Africa/Cairo',
          }).slice(0, 5),
      }))
    );
  };

  const handleDateChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const dateId = Number(e.target.value);
    setSelectedDate(dateId);
    await fetchAttendance(dateId);
  };

  const filteredStudents = students.filter(stu =>
    stu.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStudentClass = (student_id: number) => {
    const stu = students.find(s => s.student_id === student_id);
    if (!stu) return '';
    const cls = classes.find(c => c.class_id === stu.class_id);
    if (!cls) return '';
    return `${cls.class_name} - ${cls.gender ? 'ذكور' : 'إناث'}`;
  };

  const getStatus = (time: string) => {
    const [hour, minute] = time.split(':').map(Number);
    return hour > 16 || (hour === 16 && minute > 30) ? 'متأخر' : 'حاضر مبكراً';
  };

  const handleAddOrUpdate = async () => {
    if (!formStudent.student_id || !selectedDate) return;

    const time = new Date().toLocaleTimeString('en-GB', {
      hour12: false,
      timeZone: 'Africa/Cairo',
    }).slice(0, 5);

    const formData = new FormData();
    formData.append('student_id', formStudent.student_id.toString());
    formData.append('school_day_id', selectedDate.toString());
    formData.append('attended', 'true');
    formData.append('time', time);
    formData.append('user_id', (userId ?? 1).toString());
    if (editingId) {
      await updateAttendance(editingId, formData);
    } else {
      await createAttendance(formData);
    }

    setFormStudent({ student_id: 0 });
    setEditingId(null);
    fetchAttendance(selectedDate);
  };

  const handleEdit = (att: Attendance) => {
    setEditingId(att.attendance_id);
    setFormStudent({ student_id: att.student_id });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف الحضور؟')) return;
    await deleteAttendance(id);
    if (selectedDate) fetchAttendance(selectedDate);
  };

  // Pagination logic
  const totalPages = Math.ceil(attendance.length / pageSize);
  const paginatedAttendance = attendance.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-6">إدارة الحضور</h1>

      {/* Select Date */}
      <div className="flex justify-center gap-3 mb-6">
        <label className="font-semibold">اختر اليوم:</label>
        <select
          value={selectedDate ?? 0}
          onChange={handleDateChange}
          className="border border-gray-300 px-3 py-1 rounded focus:outline-none focus:border-blue-500"
        >
          <option value={0} disabled>
            اختر اليوم
          </option>
          {schoolDays.map(day => (
       <option key={day.school_day_id} value={day.school_day_id}>
  {formatDate(day.school_date)}
</option>
          ))}
        </select>
      </div>

      {/* Search Student */}
      <div className="flex justify-center mb-4">
        <input
          type="text"
          placeholder="ابحث باسم الطالب..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-1/2 border border-gray-300 px-3 py-1 rounded focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Student Dropdown */}
      {searchQuery && (
        <div className="flex justify-center mb-4">
          <div className="w-1/2 bg-white border border-gray-300 rounded shadow-sm">
            {filteredStudents.map(stu => (
              <div
                key={stu.student_id}
                className="flex justify-between items-center px-3 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => setFormStudent({ student_id: stu.student_id })}
              >
                <span>{stu.name}</span>
                <span className={stu.gender ? 'text-blue-500' : 'text-pink-500'}>
                  {stu.gender ? 'ذكر' : 'أنثى'}
                </span>
                <span>{getStudentClass(stu.student_id)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Button */}
      {formStudent.student_id > 0 && (
        <div className="flex justify-center mb-6">
          <Button onClick={handleAddOrUpdate} variant={editingId ? 'primary' : 'primary'} className="px-6 py-2">
            {editingId ? 'حفظ تعديل' : '➕ إضافة حضور'}
          </Button>
        </div>
      )}

      {/* Attendance Table */}
      <div className="overflow-x-auto bg-white p-4 rounded shadow">
        <table className="w-full border border-gray-200 rounded text-center">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-3 py-2">الاسم</th>
              <th className="border px-3 py-2">الفصل</th>
              <th className="border px-3 py-2">الحالة</th>
              <th className="border px-3 py-2">الوقت</th>
              <th className="border px-3 py-2">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {paginatedAttendance.map(att => {
              const stu = students.find(s => s.student_id === att.student_id);
              if (!stu) return null;
              return (
                <tr key={att.attendance_id} className="hover:bg-gray-50">
                  <td className="border px-2 py-1">{stu.name}</td>
                  <td className="border px-2 py-1">{getStudentClass(stu.student_id)}</td>
                  <td className="border px-2 py-1">{getStatus(att.time)}</td>
                  <td className="border px-2 py-1">{att.time}</td>
                  <td className="border px-2 py-1 flex justify-center gap-2">
                    <Button onClick={() => handleEdit(att)} className="px-3 py-1 text-sm" variant="primary">✏️</Button>
                    <Button onClick={() => handleDelete(att.attendance_id)} className="px-3 py-1 text-sm" variant="danger">🗑️</Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center gap-2 mt-4">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(prev => prev - 1)}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          السابق
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`px-3 py-1 border rounded ${currentPage === page ? 'bg-blue-500 text-white' : ''}`}
          >
            {page}
          </button>
        ))}
        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(prev => prev + 1)}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          التالي
        </button>
      </div>
    </div>
  );
}
