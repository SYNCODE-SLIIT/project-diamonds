import React, { useState, useEffect, useContext, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/userContext';
import 'boxicons';
import axiosInstance from '../../utils/axiosInstance';
import BudgetForm from '../../components/Financial/BudgetForm';

const AdminSidebar = () => {
  // State management
  const [openSection, setOpenSection] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [totalUnread, setTotalUnread] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);

  // Refs and context
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const lastTotalRef = useRef(0);
  const hoverTimerRef = useRef(null);
  const sidebarRef = useRef(null);

  // Poll unread count for Inbox
  useEffect(() => {
    let interval;
    const fetchTotal = async () => {
      // Get auth token and bail if missing or invalid
      const token = localStorage.getItem('token');
      if (!token || token === 'null') return;
      try {
        // Fetch group chat unread counts with auth header
        const groupRes = await axiosInstance.get(`/api/chat-groups/user/${user._id}`);
        const groupData = groupRes.data;
        const unreadGroups = (groupData.groups || []).reduce((sum, g) => sum + (g.unreadCount || 0), 0);
        // Fetch direct chat unread counts
        const directRes = await axiosInstance.get(`/api/direct-chats/user/${user._id}`);
        const directData = directRes.data;
        const unreadDirect = (directData.threads || []).reduce((sum, t) => sum + (t.unreadCount || 0), 0);
        const total = unreadGroups + unreadDirect;
        if (total !== lastTotalRef.current) {
          setTotalUnread(total);
          lastTotalRef.current = total;
        }
      } catch {}
    };
    if (user && user._id) {
      fetchTotal();
      interval = setInterval(fetchTotal, 3000);
    }
    return () => clearInterval(interval);
  }, [user]);

  // Effect to handle route changes
  useEffect(() => {
    return () => {
      if (!isLocked) {
        setOpenSection(null);
      }
    };
  }, [isLocked]);

  // Update collapsed sections when sidebar is collapsed
  useEffect(() => {
    if (!isExpanded && !isLocked && openSection) {
      setOpenSection(null);
    }
  }, [isExpanded, isLocked, openSection]);

  // Toggle section open/closed
  const toggleSection = (section) => {
    // If sidebar is not expanded and we're trying to open a section, 
    // we need to expand and lock the sidebar first
    if (!isExpanded) {
      setIsExpanded(true);
      setIsLocked(true);
      
      if (sidebarRef.current) {
        sidebarRef.current.classList.add('sidebar-locked');
      }
      
      // Set the section after a small delay to allow the sidebar to expand
      setTimeout(() => {
        setOpenSection(section);
      }, 50);
      return;
    }
    
    // Normal toggle behavior when sidebar is already expanded
    setOpenSection(openSection === section ? null : section);
  };

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Mouse enter/leave handlers for hover expansion
  const handleMouseEnter = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
    }
    setIsHovering(true);
    
    // Don't auto-expand if explicitly locked or collapsed
    if (!isExpanded && !isLocked) {
      hoverTimerRef.current = setTimeout(() => {
        setIsExpanded(true);
      }, 0); // Slight delay before expanding
    }
  };

  const handleMouseLeave = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
    }
    setIsHovering(false);
    
    // Only auto-collapse if it was expanded by hover and not locked
    if (isExpanded && !isLocked) {
      hoverTimerRef.current = setTimeout(() => {
        setIsExpanded(false);
      }, 50); // Slight delay before collapsing
    }
  };

  // Toggle sidebar lock state (hamburger acts as lock/unlock toggle)
  const toggleSidebar = () => {
    // compute the next locked state
    const newLockedState = !isLocked;
    setIsLocked(newLockedState);

    // when locking, force the sidebar open
    // when unlocking, collapse only if the cursor isn't currently hovering
    if (newLockedState) {
      setIsExpanded(true);
    } else if (!isHovering) {
      setIsExpanded(false);
    }

    // reflect the lock state on the DOM element for external selectors
    if (sidebarRef.current) {
      if (newLockedState) {
        sidebarRef.current.classList.add('sidebar-locked');
      } else {
        sidebarRef.current.classList.remove('sidebar-locked');
      }
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isExpanded && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => {
            // Only close if not locked
            if (!isLocked) {
              setIsExpanded(false);
            }
          }}
        />
      )}
      
      {/* Main sidebar */}
      <aside
        ref={sidebarRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`
          fixed top-0 left-0 h-full z-50
          ${isExpanded ? 'w-72' : 'w-22'} 
          bg-gradient-to-b from-[#0d253f] to-[#1c4b82]
          transition-all duration-300 ease-in-out
          shadow-[0_0_30px_rgba(0,0,0,0.25)]
          overflow-hidden
        `}
      >
        {/* Header with toggle button */}
        <div
          className={`
            h-16 flex items-center
            ${isExpanded ? 'px-6' : 'px-6'}
            border-b border-cyan-400/30
          `}
        >
          <button
            onClick={toggleSidebar}
            className={`
     flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-full
     text-gray-400 hover:text-white
     ${isLocked 
       ? 'bg-blue-500/20 text-white' 
       : 'hover:bg-blue-500/20'}
     transition-all duration-200
   `}
            title={isLocked ? 'Unlock sidebar' : 'Lock sidebar open'}
            aria-label={isLocked ? 'Unlock sidebar' : 'Lock sidebar open'}
          >
            <box-icon name="menu" color="currentColor" size="sm"></box-icon>
          </button>
          
          <div className={`ml-3 overflow-hidden transition-all duration-300 ${isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
            <h1 className="text-white font-semibold text-lg">Admin Panel</h1>
          </div>
        </div>

        {/* Navigation */}
        <nav className="pt-4 pb-4 h-[calc(100%-4rem)] flex flex-col">
          <div className="space-y-3 px-3 overflow-y-auto scrollbar-thin">
            {/* User Management */}
            <div className="relative">
              <button
                onClick={() => toggleSection('users')}
                className={`
                  w-full flex items-center justify-between px-3 py-2.5 rounded-xl
                  ${openSection === 'users' 
                    ? 'bg-gradient-to-r from-blue-500/30 to-cyan-600/20 text-white font-medium'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'}
                  group transition-all duration-200
                `}
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-9 h-9 flex items-center justify-center relative">
                    <box-icon name="user" color="currentColor"></box-icon>
                    <span className="absolute inset-0 rounded-lg group-hover:bg-blue-500/10 transition-colors duration-200"></span>
                  </div>
                  
                  <span className={`ml-3 whitespace-nowrap transition-all duration-300 ${isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
                    User Management
                  </span>
                </div>
                
                {isExpanded && (
                  <span className="w-6 flex justify-center transition-transform duration-200">
                    <box-icon 
                      name="chevron-down" 
                      color="currentColor" 
                      size="sm"
                      className={`transform ${openSection === 'users' ? 'rotate-180' : 'rotate-0'}`}
                    ></box-icon>
                  </span>
                )}
              </button>
              
              {/* User Management Dropdown */}
              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openSection === 'users' && isExpanded ? 'max-h-60 opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
                <ul className="pl-12 pr-3 pb-1 space-y-1">
                  <li>
                    <NavLink
                      to="/admin/applications/combined"
                      className={({ isActive }) => `
                        block py-2 px-3 rounded-lg text-sm
                        ${isActive ? 'bg-blue-500/10 text-blue-300' : 'text-gray-300 hover:text-white hover:bg-white/5'}
                        transition-colors duration-200
                      `}
                    >
                      Applications
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/admin/members"
                      className={({ isActive }) => `
                        block py-2 px-3 rounded-lg text-sm
                        ${isActive ? 'bg-blue-500/10 text-blue-300' : 'text-gray-300 hover:text-white hover:bg-white/5'}
                        transition-colors duration-200
                      `}
                    >
                      Members
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/admin/organizers"
                      className={({ isActive }) => `
                        block py-2 px-3 rounded-lg text-sm
                        ${isActive ? 'bg-blue-500/10 text-blue-300' : 'text-gray-300 hover:text-white hover:bg-white/5'}
                        transition-colors duration-200
                      `}
                    >
                      Organizers
                    </NavLink>
                  </li>
                </ul>
              </div>
            </div>

            {/* Financial Management */}
            <div className="relative">
              <button
                onClick={() => toggleSection('finance')}
                className={`
                  w-full flex items-center justify-between px-3 py-2.5 rounded-xl
                  ${openSection === 'finance'
                    ? 'bg-gradient-to-r from-blue-500/30 to-cyan-600/20 text-white font-medium'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'}
                  group transition-all duration-200
                `}
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-9 h-9 flex items-center justify-center relative">
                    <box-icon name="dollar" color="currentColor"></box-icon>
                    <span className="absolute inset-0 rounded-lg group-hover:bg-blue-500/10 transition-colors duration-200"></span>
                  </div>
                  
                  <span className={`ml-3 whitespace-nowrap transition-all duration-300 ${isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
                    Financial Management
                  </span>
                </div>
                
                {isExpanded && (
                  <span className="w-6 flex justify-center transition-transform duration-200">
                    <box-icon 
                      name="chevron-down" 
                      color="currentColor" 
                      size="sm"
                      className={`transform ${openSection === 'finance' ? 'rotate-180' : 'rotate-0'}`}
                    ></box-icon>
                  </span>
                )}
              </button>
              
              {/* Financial Management Dropdown */}
              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openSection === 'finance' && isExpanded ? 'max-h-60 opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
                <ul className="pl-12 pr-3 pb-1 space-y-1">
                  <li>
                    <NavLink
                      to="/admin/financial"
                      className={({ isActive }) => `
                        block py-2 px-3 rounded-lg text-sm
                        ${isActive ? 'bg-blue-500/10 text-blue-300' : 'text-gray-300 hover:text-white hover:bg-white/5'}
                        transition-colors duration-200
                      `}
                    >
                      Dashboard
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/admin/financial/anomalies"
                      className={({ isActive }) => `
                        block py-2 px-3 rounded-lg text-sm
                        ${isActive ? 'bg-blue-500/10 text-blue-300' : 'text-gray-300 hover:text-white hover:bg-white/5'}
                        transition-colors duration-200
                      `}
                    >
                      Anomaly Detection
                    </NavLink>
                  </li>
                </ul>
              </div>
            </div>

            {/* Media Management */}
            <div className="relative">
              <button
                onClick={() => toggleSection('media')}
                className={`
                  w-full flex items-center justify-between px-3 py-2.5 rounded-xl
                  ${openSection === 'media'
                    ? 'bg-gradient-to-r from-blue-500/30 to-cyan-600/20 text-white font-medium'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'}
                  group transition-all duration-200
                `}
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-9 h-9 flex items-center justify-center relative">
                    <box-icon name="video" color="currentColor"></box-icon>
                    <span className="absolute inset-0 rounded-lg group-hover:bg-blue-500/10 transition-colors duration-200"></span>
                  </div>
                  
                  <span className={`ml-3 whitespace-nowrap transition-all duration-300 ${isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
                    Media Management
                  </span>
                </div>
                
                {isExpanded && (
                  <span className="w-6 flex justify-center transition-transform duration-200">
                    <box-icon 
                      name="chevron-down" 
                      color="currentColor" 
                      size="sm"
                      className={`transform ${openSection === 'media' ? 'rotate-180' : 'rotate-0'}`}
                    ></box-icon>
                  </span>
                )}
              </button>
              
              {/* Media Management Dropdown */}
              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openSection === 'media' && isExpanded ? 'max-h-96 opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
                <ul className="pl-12 pr-3 pb-1 space-y-1">
                  <li>
                    <NavLink
                      to="/admin/blog"
                      className={({ isActive }) => `
                        block py-2 px-3 rounded-lg text-sm
                        ${isActive ? 'bg-blue-500/10 text-blue-300' : 'text-gray-300 hover:text-white hover:bg-white/5'}
                        transition-colors duration-200
                      `}
                    >
                      Blog Posts
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/admin/media"
                      className={({ isActive }) => `
                        block py-2 px-3 rounded-lg text-sm
                        ${isActive ? 'bg-blue-500/10 text-blue-300' : 'text-gray-300 hover:text-white hover:bg-white/5'}
                        transition-colors duration-200
                      `}
                    >
                      Media
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/admin/social-media"
                      className={({ isActive }) => `
                        block py-2 px-3 rounded-lg text-sm
                        ${isActive ? 'bg-blue-500/10 text-blue-300' : 'text-gray-300 hover:text-white hover:bg-white/5'}
                        transition-colors duration-200
                      `}
                    >
                      Social Media Feed
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/admin/merchandise"
                      className={({ isActive }) => `
                        block py-2 px-3 rounded-lg text-sm
                        ${isActive ? 'bg-blue-500/10 text-blue-300' : 'text-gray-300 hover:text-white hover:bg-white/5'}
                        transition-colors duration-200
                      `}
                    >
                      Merchandise
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/admin/collaboration"
                      className={({ isActive }) => `
                        block py-2 px-3 rounded-lg text-sm
                        ${isActive ? 'bg-blue-500/10 text-blue-300' : 'text-gray-300 hover:text-white hover:bg-white/5'}
                        transition-colors duration-200
                      `}
                    >
                      Collaboration
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/admin/content-creators"
                      className={({ isActive }) => `
                        block py-2 px-3 rounded-lg text-sm
                        ${isActive ? 'bg-blue-500/10 text-blue-300' : 'text-gray-300 hover:text-white hover:bg-white/5'}
                        transition-colors duration-200
                      `}
                    >
                      Content
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/admin/certificate-generator"
                      className={({ isActive }) => `
                        block py-2 px-3 rounded-lg text-sm
                        ${isActive ? 'bg-blue-500/10 text-blue-300' : 'text-gray-300 hover:text-white hover:bg-white/5'}
                        transition-colors duration-200
                      `}
                    >
                      Certificate Generator
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/admin/sponsorship"
                      className={({ isActive }) => `
                        block py-2 px-3 rounded-lg text-sm
                        ${isActive ? 'bg-blue-500/10 text-blue-300' : 'text-gray-300 hover:text-white hover:bg-white/5'}
                        transition-colors duration-200
                      `}
                    >
                      Sponsorship
                    </NavLink>
                  </li>
                </ul>
              </div>
            </div>

            {/* Event Management */}
            <div className="relative">
              <button
                onClick={() => toggleSection('events')}
                className={`
                  w-full flex items-center justify-between px-3 py-2.5 rounded-xl
                  ${openSection === 'events'
                    ? 'bg-gradient-to-r from-blue-500/30 to-cyan-600/20 text-white font-medium'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'}
                  group transition-all duration-200
                `}
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-9 h-9 flex items-center justify-center relative">
                    <box-icon name="calendar" color="currentColor"></box-icon>
                    <span className="absolute inset-0 rounded-lg group-hover:bg-blue-500/10 transition-colors duration-200"></span>
                  </div>
                  
                  <span className={`ml-3 whitespace-nowrap transition-all duration-300 ${isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
                    Event Management
                  </span>
                </div>
                
                {isExpanded && (
                  <span className="w-6 flex justify-center transition-transform duration-200">
                    <box-icon 
                      name="chevron-down" 
                      color="currentColor" 
                      size="sm"
                      className={`transform ${openSection === 'events' ? 'rotate-180' : 'rotate-0'}`}
                    ></box-icon>
                  </span>
                )}
              </button>
              
              {/* Event Management Dropdown */}
              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openSection === 'events' && isExpanded ? 'max-h-72 opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
                <ul className="pl-12 pr-3 pb-1 space-y-1">
                  <li>
                    <NavLink
                      to="/admin/packages"
                      className={({ isActive }) => `
                        block py-2 px-3 rounded-lg text-sm
                        ${isActive ? 'bg-blue-500/10 text-blue-300' : 'text-gray-300 hover:text-white hover:bg-white/5'}
                        transition-colors duration-200
                      `}
                    >
                      Packages
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/admin/services"
                      className={({ isActive }) => `
                        block py-2 px-3 rounded-lg text-sm
                        ${isActive ? 'bg-blue-500/10 text-blue-300' : 'text-gray-300 hover:text-white hover:bg-white/5'}
                        transition-colors duration-200
                      `}
                    >
                      Additional Services
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/admin/event-requests"
                      className={({ isActive }) => `
                        block py-2 px-3 rounded-lg text-sm
                        ${isActive ? 'bg-blue-500/10 text-blue-300' : 'text-gray-300 hover:text-white hover:bg-white/5'}
                        transition-colors duration-200
                      `}
                    >
                      Event Requests
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/admin/events"
                      className={({ isActive }) => `
                        block py-2 px-3 rounded-lg text-sm
                        ${isActive ? 'bg-blue-500/10 text-blue-300' : 'text-gray-300 hover:text-white hover:bg-white/5'}
                        transition-colors duration-200
                      `}
                    >
                      Events
                    </NavLink>
                  </li>
                </ul>
              </div>
            </div>

            {/* Team Management */}
            <div className="relative">
              <button
                onClick={() => toggleSection('team')}
                className={`
                  w-full flex items-center justify-between px-3 py-2.5 rounded-xl
                  ${openSection === 'team'
                    ? 'bg-gradient-to-r from-blue-500/30 to-cyan-600/20 text-white font-medium'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'}
                  group transition-all duration-200
                `}
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-9 h-9 flex items-center justify-center relative">
                    <box-icon name="group" color="currentColor"></box-icon>
                    <span className="absolute inset-0 rounded-lg group-hover:bg-blue-500/10 transition-colors duration-200"></span>
                  </div>
                  
                  <span className={`ml-3 whitespace-nowrap transition-all duration-300 ${isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
                    Team Management
                  </span>
                </div>
                
                {isExpanded && (
                  <span className="w-6 flex justify-center transition-transform duration-200">
                    <box-icon 
                      name="chevron-down" 
                      color="currentColor" 
                      size="sm"
                      className={`transform ${openSection === 'team' ? 'rotate-180' : 'rotate-0'}`}
                    ></box-icon>
                  </span>
                )}
              </button>
              
              {/* Team Management Dropdown */}
              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openSection === 'team' && isExpanded ? 'max-h-72 opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
                <ul className="pl-12 pr-3 pb-1 space-y-1">
                  <li>
                    <NavLink
                      to="/admin/dashboard"
                      className={({ isActive }) => `
                        block py-2 px-3 rounded-lg text-sm
                        ${isActive ? 'bg-blue-500/10 text-blue-300' : 'text-gray-300 hover:text-white hover:bg-white/5'}
                        transition-colors duration-200
                      `}
                    >
                      Event Assignments
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/admin/event-calendar"
                      className={({ isActive }) => `
                        block py-2 px-3 rounded-lg text-sm
                        ${isActive ? 'bg-blue-500/10 text-blue-300' : 'text-gray-300 hover:text-white hover:bg-white/5'}
                        transition-colors duration-200
                      `}
                    >
                      Calendar
                    </NavLink>
                  </li>
                        <li className="mb-[15px]">
                <NavLink
                  to="/admin/practice-assign"
                  className={({ isActive }) =>
                    `${isActive ? 'bg-[rgba(79,70,229,0.25)] font-bold' : ''} 
                    flex items-center gap-[10px] text-white no-underline text-[16px] p-[10px] rounded-[8px]
                    transition-colors duration-300 ease hover:bg-[rgba(79,70,229,0.15)]`
                  }
                >
                 Practices
                </NavLink>
              </li>
                  <li>
                    <NavLink
                      to="/admin/budget-requests"
                      className={({ isActive }) => `
                        block py-2 px-3 rounded-lg text-sm
                        ${isActive ? 'bg-blue-500/10 text-blue-300' : 'text-gray-300 hover:text-white hover:bg-white/5'}
                        transition-colors duration-200
                      `}
                    >
                      Budget Request
                    </NavLink>
                  </li>
                </ul>
              </div>

            </div>


            {/* Inbox with notification badge */}
            <NavLink
              to="/admin/inbox"
              className={({ isActive }) => `
                flex items-center px-3 py-2.5 rounded-xl
                ${isActive 
                  ? 'bg-gradient-to-r from-blue-500/30 to-cyan-600/20 text-white font-medium'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'}
                group transition-all duration-200 relative
              `}
            >
              <div className="flex-shrink-0 w-9 h-9 flex items-center justify-center relative">
                <box-icon name="message-square-dots" color="currentColor"></box-icon>
                <span className="absolute inset-0 rounded-lg group-hover:bg-blue-500/10 transition-colors duration-200"></span>
              </div>
              
              <span className={`ml-3 whitespace-nowrap transition-all duration-300 ${isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
                Inbox
              </span>
              
              {totalUnread > 0 && (
                <span className={`
                  flex items-center justify-center min-w-[20px] h-5 text-xs font-medium text-white 
                  bg-blue-500 rounded-full absolute
                  ${isExpanded ? 'right-3' : 'top-1 right-2'}
                  transition-all duration-300
                `}>
                  {totalUnread}
                </span>
              )}
            </NavLink>
          </div>

          {/* Profile and Logout */}
          <div className="mt-auto pt-3 border-t border-cyan-400/30 px-3">
            <NavLink
              to="/admin/profile"
              className={({ isActive }) => `
                flex items-center px-3 py-2.5 rounded-xl mb-1
                ${isActive 
                  ? 'bg-gradient-to-r from-blue-500/30 to-cyan-600/20 text-white font-medium'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'}
                group transition-all duration-200
              `}
            >
              <div className="flex-shrink-0 w-9 h-9 flex items-center justify-center relative">
                {user && user.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt="Profile"
                    className="w-7 h-7 rounded-full object-cover border border-blue-700"
                  />
                ) : (
                  <box-icon name="user" type="solid" color="currentColor"></box-icon>
                )}
                <span className="absolute inset-0 rounded-lg group-hover:bg-blue-500/10 transition-colors duration-200"></span>
              </div>
              
              <span className={`ml-3 whitespace-nowrap truncate transition-all duration-300 ${isExpanded ? 'opacity-100 w-auto max-w-[150px]' : 'opacity-0 w-0'}`}>
                {user ? user.fullName : "Admin Profile"}
              </span>
            </NavLink>
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-3 py-2.5 rounded-xl text-gray-300 hover:text-white hover:bg-red-500/10 group transition-all duration-200"
            >
              <div className="flex-shrink-0 w-9 h-9 flex items-center justify-center relative">
                <box-icon name="log-out" color="currentColor"></box-icon>
                <span className="absolute inset-0 rounded-lg group-hover:bg-red-500/10 transition-colors duration-200"></span>
              </div>
              
              <span className={`ml-3 whitespace-nowrap transition-all duration-300 ${isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
                Log out
              </span>
            </button>
          </div>
        </nav>
      </aside>
      
      {/* Budget Form Modal */}
      {showBudgetModal && <BudgetForm onClose={() => setShowBudgetModal(false)} />}
    </>
  );
};

export default AdminSidebar;