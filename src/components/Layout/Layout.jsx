import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar – fixed left */}
      <Sidebar />
      {/* Main content area (with header + scrollable children) */}
      <div className="flex flex-1 flex-col ml-64">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;