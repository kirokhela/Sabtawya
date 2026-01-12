// File: app/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import bgImage from '../public/bg.jpg';
import { loginAction } from './actions';

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
    <div
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        backgroundImage: `url(${bgImage.src})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        fontFamily: "'Cairo', sans-serif",
      }}
    >
      {/* Dark overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.45)',
          zIndex: 1,
        }}
      />

      {/* Login Box */}
      <div style={{ ...styles.loginBox, position: 'relative', zIndex: 2 }}>
        <img src="/Church.jpg" alt="Logo" style={styles.logo} />
        <h3 style={{ marginBottom: 25, fontWeight: 700 }}>تسجيل الدخول</h3>

        <form onSubmit={handleLogin}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>الإيميل</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>كلمة السر</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <button type="submit" style={styles.button}>دخول</button>

          {error && <p style={{ color: 'red', marginTop: 12 }}>{error}</p>}
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
