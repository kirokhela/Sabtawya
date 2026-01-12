'use client';

import { useEffect, useState } from 'react';
import {
  createStudent,
  deleteStudent,
  getClasses,
  getStudents,
  updateStudent
} from '../actions';

import type { Student } from '../actions';

interface Class {
  class_id: number;
  class_name: string;
  gender: boolean;
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: '', class_id: 0, gender: true });

  // Search & Filters
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState<number>(0);
  const [filterGender, setFilterGender] = useState<'all' | 'male' | 'female'>('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Fetch students and classes
  const fetchAll = async () => {
    setLoading(true);
    const studentsData = await getStudents();
    const classesData = await getClasses();
    setStudents(studentsData);
    setClasses(classesData);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const startEdit = (student: Student) => {
    setEditingId(student.student_id);
    setFormData({ 
      name: student.name, 
      class_id: student.class_id, 
      gender: student.gender 
    });
    setIsAdding(false);
  };

  const cancelForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ name: '', class_id: classes[0]?.class_id || 0, gender: true });
  };

  const handleCreate = async () => {
    if (!formData.name.trim() || formData.class_id === 0) return;
    const formDataObj = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      formDataObj.append(key, value.toString());
    });
    await createStudent(formDataObj);
    await fetchAll();
    cancelForm();
  };

  const handleUpdate = async () => {
    if (!formData.name.trim() || !editingId) return;
    const formDataObj = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      formDataObj.append(key, value.toString());
    });
    await updateStudent(editingId, formDataObj);
    await fetchAll();
    cancelForm();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا المخدوم؟')) return;
    await deleteStudent(id);
    await fetchAll();
  };

  // Filter & search students
  const filteredStudents = students.filter(stu => {
    const matchesSearch = stu.name.toLowerCase().includes(search.toLowerCase());
    const matchesClass = filterClass === 0 || stu.class_id === filterClass;
    const matchesGender =
      filterGender === 'all' ||
      (filterGender === 'male' && stu.gender) ||
      (filterGender === 'female' && !stu.gender);
    return matchesSearch && matchesClass && matchesGender;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const changePage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <p className="text-gray-500 text-lg">جاري التحميل...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold mb-1">إدارة المخدومين</h1>
        <p className="text-gray-500 text-sm">إضافة وتعديل وحذف المخدومين</p>
      </div>

      {/* Add Button */}
      {!isAdding && !editingId && (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full mb-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition"
        >
          ➕ إضافة مخدوم جديد
        </button>
      )}

      {/* Create/Edit Form */}
      {(isAdding || editingId) && (
        <div className="bg-white p-6 rounded-xl shadow mb-6 border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">{editingId ? 'تعديل المخدوم' : 'إضافة مخدوم جديد'}</h2>
            <button onClick={cancelForm} className="text-gray-400 text-xl">✕</button>
          </div>

          {/* Name */}
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-1">الاسم</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="أدخل اسم المخدوم"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Class Dropdown */}
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-1">الفصل</label>
          <select
  value={formData.class_id}
  onChange={(e) => setFormData({ ...formData, class_id: Number(e.target.value) })}
  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
>
  <option value={0} disabled>اختر الفصل</option>
  {classes.map(cls => (
    <option key={cls.class_id} value={cls.class_id}>
      {cls.class_name} - {cls.gender ? 'ذكور' : 'إناث'}
    </option>
  ))}
</select>

          </div>

          {/* Gender */}
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-1">النوع</label>
            <div className="flex gap-4">
              <label
                className={`flex-1 cursor-pointer text-center py-2 rounded border ${formData.gender ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300'}`}
                onClick={() => setFormData({ ...formData, gender: true })}
              >
                ذكر
              </label>
              <label
                className={`flex-1 cursor-pointer text-center py-2 rounded border ${!formData.gender ? 'border-pink-500 bg-pink-50 text-pink-700' : 'border-gray-300'}`}
                onClick={() => setFormData({ ...formData, gender: false })}
              >
                أنثى
              </label>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              onClick={editingId ? handleUpdate : handleCreate}
              className="flex-1 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded transition"
            >
              {editingId ? '💾 حفظ' : '➕ إضافة'}
            </button>
            <button
              onClick={cancelForm}
              className="flex-1 py-2 bg-gray-400 hover:bg-gray-500 text-white font-semibold rounded transition"
            >
              إلغاء
            </button>
          </div>
        </div>
      )}

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
        <input
          type="text"
          placeholder="ابحث بالاسم..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500 flex-1"
        />

        <select
          value={filterClass}
          onChange={(e) => { setFilterClass(Number(e.target.value)); setCurrentPage(1); }}
          className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
        >
          <option value={0}>جميع الفصول</option>
          {classes.map(c => (
            <option key={c.class_id} value={c.class_id}>{c.class_name}</option>
          ))}
        </select>

        <select
          value={filterGender}
          onChange={(e) => { setFilterGender(e.target.value as any); setCurrentPage(1); }}
          className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
        >
          <option value="all">الكل</option>
          <option value="male">ذكر</option>
          <option value="female">أنثى</option>
        </select>
      </div>

      {/* Students List */}
      <div className="flex flex-col gap-4">
        {paginatedStudents.length === 0 ? (
          <div className="bg-white p-6 rounded-xl border border-gray-200 text-center text-gray-400">
            لا يوجد مخدومين مطابقين
          </div>
        ) : (
          paginatedStudents.map((stu) => (
            <div key={stu.student_id} className="bg-white p-4 rounded-xl border border-gray-200 flex justify-between items-center shadow-sm hover:shadow-md transition">
              <div className="flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full ${stu.gender ? 'bg-blue-500' : 'bg-pink-500'}`}></div>
                <div>
                  <h3 className="font-bold text-gray-800">{stu.name}</h3>
                  <p className="text-sm font-medium text-gray-500">
                    {classes.find(c => c.class_id === stu.class_id)?.class_name || 'لا يوجد فصل'} | {stu.gender ? 'ذكر' : 'أنثى'}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => startEdit(stu)}
                  className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded transition text-sm"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(stu.student_id)}
                  className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded transition text-sm"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4">
          <button onClick={() => changePage(currentPage - 1)} className="px-3 py-1 border rounded">❮</button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => changePage(i + 1)}
              className={`px-3 py-1 border rounded ${currentPage === i + 1 ? 'bg-blue-500 text-white' : ''}`}
            >
              {i + 1}
            </button>
          ))}
          <button onClick={() => changePage(currentPage + 1)} className="px-3 py-1 border rounded">❯</button>
        </div>
      )}
    </div>
  );
}
