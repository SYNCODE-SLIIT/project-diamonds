import React, { useState, useEffect } from 'react';
import AdminSidebar from './AdminSidebar';
import { Outlet } from 'react-router-dom';

const AdminLayout = () => {
  const [sidebarWidth, setSidebarWidth] = useState('20px');

  // Listen for changes to the sidebar width
  useEffect(() => {
    const handleSidebarChange = () => {
      // Check if sidebar is expanded/collapsed by finding the AdminSidebar element
      const sidebarElement = document.querySelector('aside');
      if (sidebarElement) {
        const isExpanded = sidebarElement.classList.contains('sidebar-locked') || 
                           sidebarElement.className.includes('w-72');
        setSidebarWidth(isExpanded ? '288px' : '80px'); // 72px (sidebar) + 16px padding or 20px + padding
      }
    };

    // Initial check
    handleSidebarChange();

    // Set up a mutation observer to watch for class changes on the sidebar
    const observer = new MutationObserver(handleSidebarChange);
    const sidebarElement = document.querySelector('aside');
    
    if (sidebarElement) {
      observer.observe(sidebarElement, { 
        attributes: true, 
        attributeFilter: ['class'] 
      });
    }

    // Clean up
    return () => {
      observer && observer.disconnect();
    };
  }, []);

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 60px)' }}>
      <AdminSidebar />
      <div style={{ 
        flex: 1, 
        padding: '20px', 
        marginLeft: sidebarWidth,
        transition: 'margin-left 0.3s ease'
      }}>
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;