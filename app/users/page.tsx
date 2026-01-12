'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { UserSummary as User } from '../actions';
import { createUser, deleteUser, getUsers } from '../actions';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const router = useRouter();

  // 🔐 UI Protection
  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role !== 'admin') {
      router.push('/home');
    }
  }, [router]);

  async function loadUsers() {
    const data = await getUsers();
    setUsers(data as User[]);
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function handleCreate(formData: FormData) {
    await createUser(formData);
    await loadUsers();
  }

  async function handleDelete(id: number) {
    if (!confirm('هل أنت متأكد من الحذف؟')) return;
    await deleteUser(id);
    await loadUsers();
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-center text-2xl font-bold mb-6">👤 إدارة المستخدمين</h1>

      <form action={handleCreate} className="bg-white p-6 rounded-xl shadow mb-6 border border-gray-200">
        <h3 className="font-semibold mb-3">إضافة مستخدم جديد</h3>

        <input name="name" placeholder="الإسم" required className="w-full border border-gray-300 rounded px-3 py-2 mb-3 focus:outline-none focus:border-blue-500" />
        <input name="password" type="password" placeholder="كلمة السر" required className="w-full border border-gray-300 rounded px-3 py-2 mb-3 focus:outline-none focus:border-blue-500" />

        <select name="role" className="w-full border border-gray-300 rounded px-3 py-2 mb-3 focus:outline-none focus:border-blue-500">
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>

        <div className="">
          <button type="submit" className="btn btn-primary w-full">إضافة</button>
        </div>
      </form>

      <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
        <h3 className="mb-4 font-semibold">المستخدمين</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-center table-auto">
            <thead>
              <tr className="text-sm text-gray-600">
                <th className="px-3 py-2">ID</th>
                <th className="px-3 py-2">الإسم</th>
                <th className="px-3 py-2">الدور</th>
                <th className="px-3 py-2">حذف</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">{u.id}</td>
                  <td className="px-3 py-2">{u.name}</td>
                  <td className="px-3 py-2">{u.role}</td>
                  <td className="px-3 py-2">
                    <button onClick={() => handleDelete(u.id)} className="btn btn-danger">حذف</button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-6">لا يوجد مستخدمين</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  title: {
    textAlign: 'center',
    marginBottom: 30,
    fontSize: 28,
    fontWeight: 'bold',
  },
  card: {
    background: '#fff',
    padding: 20,
    borderRadius: 14,
    marginBottom: 30,
    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
  },
  input: {
    width: '100%',
    padding: 12,
    marginBottom: 12,
    borderRadius: 10,
    border: '1px solid #ddd',
    fontSize: 14,
  },
  button: {
    width: '100%',
    padding: 12,
    borderRadius: 10,
    border: 'none',
    background: '#0070f3',
    color: '#fff',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  deleteBtn: {
    background: '#e53935',
    color: '#fff',
    border: 'none',
    padding: '6px 12px',
    borderRadius: 6,
    cursor: 'pointer',
  },
};
