'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createUser, deleteUser, getUsers } from '../actions';

type User = {
  id: number;
  name: string;
  role: string;
};

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
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <h1 style={styles.title}>👤 إدارة المستخدمين</h1>

      {/* Create User */}
      <form action={handleCreate} style={styles.card}>
        <h3>إضافة مستخدم جديد</h3>

        <input name="name" placeholder="الإسم" required style={styles.input} />
        <input
          name="password"
          type="password"
          placeholder="كلمة السر"
          required
          style={styles.input}
        />

        <select name="role" style={styles.input}>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>

        <button style={styles.button}>إضافة</button>
      </form>

      {/* Users Table */}
      <div style={styles.card}>
        <h3>المستخدمين</h3>

        <table style={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>الإسم</th>
              <th>الدور</th>
              <th>حذف</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.name}</td>
                <td>{u.role}</td>
                <td>
                  <button
                    onClick={() => handleDelete(u.id)}
                    style={styles.deleteBtn}
                  >
                    حذف
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: 20 }}>
                  لا يوجد مستخدمين
                </td>
              </tr>
            )}
          </tbody>
        </table>
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
