'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import bgImage from '../public/bg.jpg';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  const router = useRouter();
  const pathname = usePathname();

  const isLoginPage = pathname === '/';

  useEffect(() => {
    const storedRole = typeof window !== 'undefined' ? localStorage.getItem('role') : null;
    setRole(storedRole);
  }, []);

  const handleSignOut = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
      localStorage.removeItem('role');
      router.push('/');
    }
  };

  const links = [
    { href: '/home', label: '🏠 الرئيسية' },
    { href: '/classes', label: '📚 الفصول' },
    { href: '/students', label: '🙋‍♂️ المخدومين' },
    { href: '/attendance', label: '✅ الحضور' },
  ];

  if (role === 'admin') links.push({ href: '/users', label: '👤 إدارة المستخدمين' });

  return (
    <html lang="ar" dir="rtl">
      <body
        className="min-h-screen font-sans relative"
        style={{

  // Black overlay + image
  backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${bgImage.src})`,
  backdropFilter: 'blur(8px)',
  backgroundSize: 'contain',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'center top',


        }}
      >
        {!isLoginPage && (
          <>
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex md:flex-col md:fixed md:top-0 md:right-0 md:h-full md:w-72 bg-black/30 backdrop-blur-sm p-6 z-40 shadow-lg rounded-l-lg">
              <div className="mb-6">
                <h2 className="text-lg font-bold text-white">نظام إدارة الخدمة</h2>
                <p className="text-sm text-gray-300">لوحة التحكم</p>
              </div>
              <nav className="flex flex-col gap-2">
                {links.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="py-2 px-3 rounded text-white hover:bg-white/10 transition"
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
              <div className="mt-auto">
                <button
                  onClick={handleSignOut}
                  className="w-full py-2 px-3 rounded border border-white text-white hover:bg-white/10 transition"
                >
                  تسجيل الخروج
                </button>
              </div>
            </aside>

            {/* Mobile Header */}
            <header className="md:hidden bg-white w-full p-4 shadow-sm sticky top-0 z-30">
              <div className="flex items-center justify-between">
                <strong>نظام الخدمة</strong>
                <button
                  aria-label="Open menu"
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 rounded bg-white shadow"
                >
                  ☰
                </button>
              </div>
            </header>

            {/* Mobile Sidebar */}
            {sidebarOpen && (
              <>
                {/* Overlay */}
                <div
                  className="fixed inset-0 bg-black/50 z-40"
                  onClick={() => setSidebarOpen(false)}
                />

                <aside className="fixed top-0 right-0 h-full w-72 bg-black/30 backdrop-blur-md p-6 z-50 shadow-lg rounded-l-lg flex flex-col">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="text-lg font-bold text-white">نظام إدارة الخدمة</h2>
                      <p className="text-sm text-gray-300">لوحة التحكم</p>
                    </div>
                    <button
                      aria-label="Close menu"
                      onClick={() => setSidebarOpen(false)}
                      className="text-white text-lg"
                    >
                      ✕
                    </button>
                  </div>

                  <nav className="flex flex-col gap-3 flex-1">
                    {links.map((link) => (
                      <a
                        key={link.href}
                        href={link.href}
                        onClick={() => setSidebarOpen(false)}
                        className="py-2 px-3 rounded text-white hover:bg-white/10 transition"
                      >
                        {link.label}
                      </a>
                    ))}
                  </nav>

                  <div className="mt-6">
                    <button
                      onClick={handleSignOut}
                      className="w-full py-2 px-3 rounded border border-white text-white hover:bg-white/10 transition"
                    >
                      تسجيل الخروج
                    </button>
                  </div>
                </aside>
              </>
            )}
          </>
        )}

        {/* Main Content */}
        <main className={`flex-1 ${!isLoginPage ? 'md:mr-72' : ''} py-6`}>
          <div className="container">{children}</div>
        </main>
      </body>
    </html>
  );
}
