'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import bgImage from '../public/bg.jpg'; // reference your image
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  const router = useRouter();
  const pathname = usePathname();

  const isLoginPage = pathname === '/';

  useEffect(() => {
    const storedRole = localStorage.getItem('role');
    setRole(storedRole);
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    router.push('/');
  };

  return (
    <html lang="ar" dir="rtl">
      <body
        style={{
          margin: 0,
          fontFamily: "'Cairo', sans-serif",
          minHeight: '100vh',
          backgroundImage: `url(${bgImage.src})`,
          backgroundSize: 'contain', // smaller bg
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center top',
          display: 'flex',
        }}
      >
        {!isLoginPage && (
          <>
            {/* Sidebar */}
            <aside
              style={{
                position: 'fixed',
                top: 0,
                right: 0,
                width: 260,
                height: '100vh',
                background: '#fff',
                boxShadow: '0 0 20px rgba(0,0,0,0.15)',
                padding: 20,
                zIndex: 1000,
              }}
            >
              <h2 style={{ marginBottom: 20, fontWeight: 'bold' }}>
                نظام إدارة الخدمة
              </h2>

              <nav style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <a href="/home">🏠 الرئيسية</a>
                <a href="/classes">📚 الفصول</a>
                <a href="/students">🙋‍♂️ المخدومين</a>
                <a href="/attendance">✅ الحضور</a>

                {/* 🔐 Admin only */}
                {role === 'admin' && (
                  <a href="/users">👤 إدارة المستخدمين</a>
                )}
              </nav>

              <button
                onClick={handleSignOut}
                style={{
                  marginTop: 30,
                  color: 'red',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  background: 'none',
                  border: 'none',
                }}
              >
                تسجيل الخروج
              </button>
            </aside>
          </>
        )}

        {/* Main content */}
        <main
          style={{
            marginRight: !isLoginPage ? 260 : 0, // leave space for sidebar
            padding: 20,
            width: '100%',
            minHeight: '100vh',
            boxSizing: 'border-box',
          }}
        >
          {children}
        </main>
      </body>
    </html>
  );
}
