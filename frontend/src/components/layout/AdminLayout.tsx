import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const AdminLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('brightloop_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleCollapse = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('brightloop_sidebar_collapsed', String(next));
      } catch {
        // LocalStorage unavailable
      }
      return next;
    });
  };

  return (
    <div className="app-shell">
      {/* Skip to Content Link for Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-indigo-600 focus:text-white focus:rounded-md shadow-lg"
      >
        Skip to main content
      </a>

      {/* Responsive Sidebar */}
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggleCollapse={toggleCollapse}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div
        className={`main-area ${collapsed ? 'main-area--collapsed' : ''}`}
      >
        <Header
          onToggleMobileMenu={() => setMobileOpen((open) => !open)}
          mobileOpen={mobileOpen}
        />

        <main id="main-content" className="flex-1 pb-12" tabIndex={-1}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
