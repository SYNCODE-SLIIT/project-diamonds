import React, { useContext, useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { UserContext } from '../../context/userContext';
import Sidebar from './Sidebar';

const MemberDashboardLayout = () => {
  const { user } = useContext(UserContext);
  const [sidebarWidth, setSidebarWidth] = useState('20px');

  // Listen for changes to the sidebar width
  useEffect(() => {
    const handleSidebarChange = () => {
      // Check if sidebar has the expanded class
      const sidebarElement = document.querySelector('aside');
      if (sidebarElement) {
        const isExpanded = sidebarElement.classList.contains('sidebar-locked') || 
                           sidebarElement.className.includes('w-64');
        setSidebarWidth(isExpanded ? '264px' : '84px'); // 64px for sidebar + 20px padding
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
    <div>
      <div style={{ display: 'flex', minHeight: 'calc(100vh - 60px)' }}>
        <Sidebar />
        <div style={{ 
          flex: 1, 
          padding: '20px', 
          marginLeft: sidebarWidth,
          transition: 'margin-left 0.3s ease-in-out'
        }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default MemberDashboardLayout;