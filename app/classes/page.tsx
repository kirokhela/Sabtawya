'use client';

import { useEffect, useState } from 'react';
import { Class, createClass, deleteClass, getClasses, updateClass } from '../actions';
import Button from '../components/Button';

export default function ClassesPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ class_name: '', gender: true });

  // Fetch classes from DB
  const fetchAll = async () => {
    setLoading(true);
    const data = await getClasses();
    setClasses(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const startEdit = (classItem: Class) => {
    setEditingId(classItem.class_id);
    setFormData({ class_name: classItem.class_name, gender: classItem.gender });
    setIsAdding(false);
  };

  const cancelForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ class_name: '', gender: true });
  };

  const handleCreate = async () => {
    if (!formData.class_name.trim()) return;
    const formDataToSend = new FormData();
    formDataToSend.append('class_name', formData.class_name);
    formDataToSend.append('gender', formData.gender.toString());
    await createClass(formDataToSend);
    await fetchAll();
    cancelForm();
  };

  const handleUpdate = async () => {
    if (!formData.class_name.trim() || !editingId) return;
    const formDataToSend = new FormData();
    formDataToSend.append('class_name', formData.class_name);
    formDataToSend.append('gender', formData.gender.toString());
    await updateClass(editingId, formDataToSend);
    await fetchAll();
    cancelForm();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا الفصل؟')) return;
    await deleteClass(id);
    await fetchAll();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <p className="text-gray-500 text-lg">جاري التحميل...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-1">إدارة الفصول الدراسية</h1>
        <p className="text-gray-500 text-sm">إضافة وتعديل وحذف الفصول</p>
      </div>

      {/* Add New Button */}
      {!isAdding && !editingId && (
        <div className="w-full mb-6">
          <Button onClick={() => setIsAdding(true)} className="w-full justify-center" variant="primary">➕ إضافة فصل جديد</Button>
        </div>
      )}

      {/* Create/Edit Form */}
      {(isAdding || editingId) && (
        <div className="bg-white p-6 rounded-xl shadow mb-6 border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">{editingId ? 'تعديل الفصل' : 'إضافة فصل جديد'}</h2>
            <button onClick={cancelForm} className="text-gray-400 text-xl">✕</button>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-1">اسم الفصل</label>
            <input
              type="text"
              value={formData.class_name}
              onChange={(e) => setFormData({ ...formData, class_name: e.target.value })}
              placeholder="أدخل اسم الفصل"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-1">النوع</label>
            <div className="flex gap-4">
              <label className={`flex-1 cursor-pointer text-center py-2 rounded border ${formData.gender ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300'}`} onClick={() => setFormData({ ...formData, gender: true })}>
                ذكور
              </label>
              <label className={`flex-1 cursor-pointer text-center py-2 rounded border ${!formData.gender ? 'border-pink-500 bg-pink-50 text-pink-700' : 'border-gray-300'}`} onClick={() => setFormData({ ...formData, gender: false })}>
                إناث
              </label>
            </div>
          </div>

          <div className="flex gap-4">
            <Button onClick={editingId ? handleUpdate : handleCreate} className="flex-1" variant="primary">
              {editingId ? '💾 حفظ' : '➕ إضافة'}
            </Button>
            <Button onClick={cancelForm} className="flex-1" variant="ghost">إلغاء</Button>
          </div>
        </div>
      )}

      {/* Classes List */}
      <div className="flex flex-col gap-4">
        {classes.length === 0 ? (
          <div className="bg-white p-6 rounded-xl border border-gray-200 text-center text-gray-400">لا توجد فصول حالياً</div>
        ) : (
          classes.map((cls) => (
            <div key={cls.class_id} className="bg-white p-4 rounded-xl border border-gray-200 flex justify-between items-center shadow-sm hover:shadow-md transition">
              <div className="flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full ${cls.gender ? 'bg-blue-500' : 'bg-pink-500'}`}></div>
                <div>
                  <h3 className="font-bold text-gray-800">{cls.class_name}</h3>
                  <p className={`text-sm font-medium ${cls.gender ? 'text-blue-500' : 'text-pink-500'}`}>
                    {cls.gender ? 'فصل ذكور' : 'فصل إناث'}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => startEdit(cls)} className="px-3 py-1 text-sm" variant="primary">✏️</Button>
                <Button onClick={() => handleDelete(cls.class_id)} className="px-3 py-1 text-sm" variant="danger">🗑️</Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
