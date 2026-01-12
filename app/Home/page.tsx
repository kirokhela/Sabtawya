// File: app/home/page.tsx
'use client';

import React from 'react';

export default function HomePage() {
  const buttonStyle: React.CSSProperties = {
    backgroundColor: 'rgba(0, 112, 243, 0.85)',
    color: '#fff',
    padding: '14px 28px',
    borderRadius: '10px',
    textDecoration: 'none',
    fontWeight: 'bold',
    transition: 'all 0.3s',
    minWidth: 140,
    textAlign: 'center',
    fontSize: '16px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
    display: 'inline-block',
  };

  const buttonContainerStyle: React.CSSProperties = {
    display: 'flex',
    gap: 20,
    flexWrap: 'wrap',
    justifyContent: 'center',
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '82vw',
        height: '100vh',
 
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        padding: 20,
        overflow: 'hidden',
      }}
    >
      {/* Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.45)',
          zIndex: 1,
        }}
      />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        <h1
          style={{
            fontSize: 'clamp(24px, 5vw, 48px)',
            fontWeight: 'bold',
            color: '#fff',
            marginBottom: 15,
            lineHeight: 1.4,
            textShadow: '3px 3px 10px rgba(0,0,0,0.8)',
          }}
        >
          كنيسة السيدة العذراء<br />
          مارمينا أثناسيوس الرسولي<br />
          مدينة نصر
        </h1>

        <p
          style={{
            fontSize: 'clamp(16px, 3vw, 22px)',
            color: '#fff',
            marginBottom: 40,
            fontWeight: 500,
            textShadow: '2px 2px 8px rgba(0,0,0,0.8)',
          }}
        >
          نظام إدارة الخدمة
        </p>

        <div style={buttonContainerStyle}>
          {[
            { href: '/attendance', label: 'الحضور' },
            { href: '/students', label: 'إضافة مخدوم' },
            { href: '/classes', label: 'إنشاء فصل' },
          ].map((btn) => (
            <a
              key={btn.href}
              href={btn.href}
              style={buttonStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor =
                  'rgba(0, 112, 243, 1)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor =
                  'rgba(0, 112, 243, 0.85)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {btn.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
