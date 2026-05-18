import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar – fixed left */}
      <Sidebar />
      
      {/* Right side: fixed header + scrollable content */}
      <div className="flex flex-1 flex-col ml-64">
        <Header />  {/* Now header is outside the scrollable area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;