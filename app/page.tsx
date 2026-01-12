// File: app/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import bgImage from '../public/bg.jpg';
import { loginAction } from './actions';
import Button from './components/Button';

export default function LoginPage() {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setError('');

    const user = await loginAction(name, password);

    if (!user) {
      setError('الإسم أو كلمة السر غير صحيحين');
      return;
    }

    localStorage.setItem('user', JSON.stringify({
      id: user.id,
      name: user.name,
    }));

    localStorage.setItem('role', user.role); 


    router.push('/home');
  }

  return (
    <div className="fixed inset-0 w-screen h-screen flex items-center justify-center p-6" style={{ backgroundImage: `url(${bgImage.src})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="absolute inset-0 bg-black/50" />

      <div className="relative z-10 max-w-md w-full bg-white rounded-2xl p-8 shadow-2xl">
        <img src="/Church.jpg" alt="Logo" className="mx-auto mb-4 w-36 rounded-lg" />
        <h3 className="text-center mb-6 font-bold text-lg">تسجيل الدخول</h3>

        <form onSubmit={handleLogin}>
          <div className="mb-4 text-right">
            <label className="block text-sm font-semibold text-gray-700 mb-2">الاسم</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500" />
          </div>

          <div className="mb-4 text-right">
            <label className="block text-sm font-semibold text-gray-700 mb-2">كلمة السر</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500" />
          </div>

          <Button type="submit" className="w-full">دخول</Button>

          {error && <p className="text-red-500 mt-3">{error}</p>}
        </form>
      </div>
    </div>
  );
}
const styles: { [key: string]: React.CSSProperties } = {
  loginBox: {
    background: 'white',
    width: '100%',
    maxWidth: 380,
    padding: '40px 35px',
    borderRadius: 20,
    boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
    textAlign: 'center',
  },
  logo: {
    margin: '0 auto 20px',
    width: 190,
    borderRadius: 12,
  },
  inputGroup: {
    textAlign: 'right',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
    display: 'block',
    fontWeight: 600,
  },
  input: {
    width: '100%',
    padding: 14,
    borderRadius: 12,
    border: '1px solid #ddd',
    fontSize: 15,
  },
  button: {
    width: '100%',
    padding: 14,
    borderRadius: 12,
    border: 'none',
    background: 'linear-gradient(135deg, #4a90e2, #7b61ff)',
    color: '#fff',
    fontSize: 17,
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: 10,
  },
};
