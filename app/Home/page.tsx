'use client';

import Button from '../components/Button';

export default function HomePage() {
  const buttons = [
    { href: '/attendance', label: 'الحضور' },
    { href: '/students', label: 'إضافة مخدوم' },
    { href: '/classes', label: 'إنشاء فصل' },
  ];

  return (
    <section className="relative rounded-lg overflow-hidden" style={{ minHeight: '60vh' }}>
      <div className="absolute inset-0 bg-black/50" />

      <div className="relative z-10 flex flex-col items-center justify-center text-center py-20">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-white mb-4">كنيسة السيدة العذراء<br/>مارمينا أثناسيوس الرسولي<br/>مدينة نصر</h1>
        <p className="text-white/90 text-lg sm:text-xl mb-8">نظام إدارة الخدمة</p>

        <div className="flex gap-4 flex-wrap justify-center">
          {buttons.map((b) => (
            <Button key={b.href} href={b.href} className="text-center px-8" variant="primary">
              {b.label}
            </Button>
          ))}
        </div>
      </div>
    </section>
  );
}
