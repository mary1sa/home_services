import React, { useState, useRef, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import "./AdminDashboard.css";
import {
  FiMenu, FiHome, FiUsers, FiDollarSign, 
  FiSettings, FiLogOut, FiBell, FiSearch, 
  FiSun, FiMoon, FiChevronDown, FiChevronRight,
  FiUser, FiEdit, FiKey, FiMail, FiCreditCard, FiLock,
  FiUserPlus, FiList, FiCheck,
  FiTool,
  FiClock,
  FiLayers,
  FiGrid,
  FiPlusSquare,
  FiPlusCircle,
  FiBriefcase
} from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axiosInstance from '../../config/axiosInstance';

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [activeMenu, setActiveMenu] = useState('DashboardHome');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
  
  const profileDropdownRef = useRef(null);
  const sidebarRef = useRef(null);
  const menuToggleRef = useRef(null);
  const notificationDropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      if (!mobile && sidebarOpen) {
        setSidebarOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarOpen]);

  // Handle click outside dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
      
      if (sidebarOpen && sidebarRef.current && !sidebarRef.current.contains(event.target) && 
          !event.target.closest('.menu-toggle')) {
        setSidebarOpen(false);
      }
      
      if (notificationDropdownRef.current && !notificationDropdownRef.current.contains(event.target)) {
        setNotificationDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [sidebarOpen, isMobile]);

  // Fetch notifications and set up polling
  useEffect(() => {
   const fetchNotifications = async () => {
  try {
    const response = await axiosInstance.get('notifications');
    
    // Ensure we're working with an array
    const notifications = Array.isArray(response.data.notifications) 
      ? response.data.notifications 
      : [];
    
    setNotifications(notifications);
    setUnreadCount(notifications.filter(n => !n.read_at).length);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    toast.error('Failed to load notifications');
    setNotifications([]);
    setUnreadCount(0);
  }
};

    // Initial fetch
    fetchNotifications();
    
    // Set up polling every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (id) => {
    try {
      await axiosInstance.post(`/notifications/mark-as-read/${id}`);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n)
      );
      setUnreadCount(prev => prev - 1);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await axiosInstance.post('/notifications/mark-all-as-read');
      setNotifications(prev => 
        prev.map(n => ({ ...n, read_at: n.read_at || new Date().toISOString() }))
      );
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Failed to mark all notifications as read');
    }
  };

  const handleNotificationClick = (notification) => {
    // Mark as read if unread
    if (!notification.read_at) {
      markAsRead(notification.id);
    }
    
    // Navigate to the link if provided
    if (notification.data.link) {
      navigate(notification.data.link);
    }
    
    // Close dropdown
    setNotificationDropdownOpen(false);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleDarkMode = () => setDarkMode(!darkMode);
  const toggleMenu = (menu) => setActiveMenu(activeMenu === menu ? '' : menu);
  const handleLogout = () => navigate('/login');

  const menuItems = [
    { title: "DashboardHome", icon: <FiHome />, path: "/" },
    { 
      title: "User Management", 
      icon: <FiUsers />,
      submenus: [
        { 
          title: "All Users", 
          path: "users",
          icon: <FiList className="submenu-icon" />
        },
        { 
          title: "Add User", 
          path: "users/create",
          icon: <FiUserPlus className="submenu-icon" />
        }
      ]
    },
    { 
      title: "Tasker Management", 
      icon: <FiTool />,
      submenus: [
        { 
          title: "All Taskers", 
          path: "taskers",
          icon: <FiList className="submenu-icon" />
        },
        { 
          title: "Request tasker", 
          path: "taskers/pending",
          icon:  <FiClock className="submenu-icon" />
        }
      ]
    },

     { 
      title: "Category Management", 
      icon: <FiLayers />,
      submenus: [
        { 
          title: "All Users", 
          path: "categorys",
          icon: <FiGrid className="submenu-icon" />
        },
        { 
          title: "Add Category", 
          path: "categorys/create",
          icon: <FiPlusSquare className="submenu-icon" /> 
        }
      ]
    },
    
     { 
      title: "Service Management", 
      icon: <FiBriefcase />,
      submenus: [
        { 
          title: "All Services", 
          path: "services",
          icon: <FiList className="submenu-icon" />
        },
        { 
          title: "Add Service", 
          path: "services/create",
          icon: <FiPlusCircle className="submenu-icon" />
        }
      ]
    },


    { 
      title: "Financial", 
      icon: <FiDollarSign />,
      submenus: [
        { title: "Payments", path: "/admin/payments" }
      ]
    },


    
    { title: "Settings", icon: <FiSettings />, path: "/admin/settings" },
  ];

  return (
    <div className={`admin-container ${darkMode ? 'dark' : ''}`}>
      <nav className="admin-navbar">
        <div className="navbar-left">
          {(!sidebarOpen || isMobile) && (
            <button 
              className="menu-toggle" 
              onClick={toggleSidebar}
              ref={menuToggleRef}
            >
              <FiMenu />
            </button>
          )}
          {!sidebarOpen && (
            <div className="app-name">
              <h1>Admin Panel</h1>
            </div>
          )}
        </div>

        <div className="navbar-center">
          <div className="search-bar">
            <FiSearch className="search-icon" />
            <input className='search_dashboard' type="text" placeholder="Search..." />
          </div>
        </div>

        <div className="navbar-right">
          <button className="theme-toggle" onClick={toggleDarkMode}>
            {darkMode ? <FiSun /> : <FiMoon />}
          </button>
         <div className="notifications-wrapper" ref={notificationDropdownRef}>
  <button 
    className="notifications" 
    onClick={() => setNotificationDropdownOpen(!notificationDropdownOpen)}
  >
    <FiBell />
    {unreadCount > 0 && (
      <span className="notification-badge">{unreadCount}</span>
    )}
  </button>
  
  <div className={`notification-dropdown ${notificationDropdownOpen ? 'open' : ''}`}>
    <div className="notification-header">
      <h4>Notifications</h4>
      <button 
        className="mark-all-read"
        onClick={markAllAsRead}
        disabled={unreadCount === 0}
      >
        Mark all as read
      </button>
    </div>
    
    <div className="notification-list">
      {notifications.length > 0 ? (
        notifications.slice(0, 5).map(notification => (
          <div 
            key={notification.id} 
            className={`notification-item ${!notification.read_at ? 'unread' : ''}`}
            onClick={() => handleNotificationClick(notification)}
          >
            <div className="notification-icon">
              {/* You can customize icons based on notification type */}
              {notification.type === 'new_tasker' && <FiUserPlus />}
              {notification.type === 'payment' && <FiDollarSign />}
              {!notification.type && <FiBell />}
            </div>
            <div className="notification-content">
              <div className="notification-message">
                {notification.data?.message || 'New notification'}
              </div>
              <div className="notification-time">
                {new Date(notification.created_at).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
            {!notification.read_at && (
              <button 
                className="mark-as-read-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  markAsRead(notification.id);
                }}
                title="Mark as read"
              >
                <FiCheck size={14} />
              </button>
            )}
          </div>
        ))
      ) : (
        <div className="no-notifications">
          No new notifications
        </div>
      )}
    </div>
    
    {notifications.length > 5 && (
      <Link 
        to="/admin/notifications" 
        className="view-all"
        onClick={() => setNotificationDropdownOpen(false)}
      >
        View all notifications
      </Link>
    )}
  </div>
</div>
          
          <div className="admin-profile-dropdown" ref={profileDropdownRef}>
            <div className="admin-profile">
              <img src="/admin-avatar.jpg" alt="Admin" className="admin-avatar" />
              <div className="profile-info">
                <span className="admin-name">Admin Name</span>
                <span className="admin-role">Super Admin</span>
              </div>
              <FiChevronDown
                className="profile-icon" 
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              />
            </div>
            
            <div className={`profile-dropdown ${profileDropdownOpen ? 'open' : ''}`}>
              <div className="dropdown-header">
                <div className="dropdown-header-content">
                  <img src="/admin-avatar.jpg" alt="Admin" className="dropdown-avatar" />
                  <div>
                    <div className="dropdown-name">Admin Name</div>
                    <div className="dropdown-email">admin@example.com</div>
                  </div>
                </div>
              </div>
              
              <Link to="/admin/profile" className="dropdown-item" onClick={() => setProfileDropdownOpen(false)}>
                <FiUser className="dropdown-item-icon" />
                <span>My Profile</span>
              </Link>
              
              <Link to="/admin/profile/edit" className="dropdown-item" onClick={() => setProfileDropdownOpen(false)}>
                <FiEdit className="dropdown-item-icon" />
                <span>Edit Profile</span>
              </Link>
              
              <Link to="/admin/change-password" className="dropdown-item" onClick={() => setProfileDropdownOpen(false)}>
                <FiKey className="dropdown-item-icon" />
                <span>Change Password</span>
              </Link>
              
              <Link to="/admin/notifications" className="dropdown-item" onClick={() => setProfileDropdownOpen(false)}>
                <FiMail className="dropdown-item-icon" />
                <span>Notifications</span>
                {unreadCount > 0 && <span className="notification-count">{unreadCount}</span>}
              </Link>
              
              <Link to="/admin/billing" className="dropdown-item" onClick={() => setProfileDropdownOpen(false)}>
                <FiCreditCard className="dropdown-item-icon" />
                <span>Billing</span>
              </Link>
              
              <div className="dropdown-divider" />
              
              <Link to="/admin/settings" className="dropdown-item" onClick={() => setProfileDropdownOpen(false)}>
                <FiSettings className="dropdown-item-icon" />
                <span>Settings</span>
              </Link>
              
              <Link to="/admin/privacy" className="dropdown-item" onClick={() => setProfileDropdownOpen(false)}>
                <FiLock className="dropdown-item-icon" />
                <span>Privacy</span>
              </Link>
              
              <div className="dropdown-divider" />
              
              <button className="dropdown-item" onClick={handleLogout}>
                <FiLogOut className="dropdown-item-icon" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <aside 
        className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}
        ref={sidebarRef}
      >
        <div className="sidebar-brand">
          {sidebarOpen ? (
            <h1 className="brand-name">Admin Panel</h1>
          ) : (
            <img 
              src="/logo-icon.png"
              alt="Logo" 
              className="sidebar-logo" 
            />
          )}
        </div>
        
        <div className="sidebar-menu">
          {menuItems.map((item, index) => (
            <div key={index} className="menu-group">
              {item.path ? (
                <Link
                  to={item.path}
                  className={`menu-item ${
                    currentPath === item.path ? 'active' : ''
                  }`}
                  onClick={() => {
                    setActiveMenu(item.title);
                    if (isMobile) setSidebarOpen(false);
                  }}
                >
                  <span className="menu-icon">{item.icon}</span>
                  <span className="menu-text">{item.title}</span>
                </Link>
              ) : (
                <>
                  <div
                    className={`menu-item ${
                      item.submenus.some(sub => currentPath.startsWith(sub.path)) ? 'active' : ''
                    }`}
                    onClick={() => toggleMenu(item.title)}
                  >
                    <span className="menu-icon">{item.icon}</span>
                    <span className="menu-text">{item.title}</span>
                    <span className="menu-arrow">
                      {activeMenu === item.title ? <FiChevronDown /> : <FiChevronRight />}
                    </span>
                  </div>
                  
                  {activeMenu === item.title && (
                    <div className="submenu">
                      {item.submenus.map((sub, subIndex) => (
                        <Link
                          key={subIndex}
                          to={sub.path}
                          className={`submenu-item ${
                            currentPath.startsWith(sub.path) ? 'active' : ''
                          }`}
                          onClick={() => isMobile && setSidebarOpen(false)}
                        >
                          <span className="submenu-icon">{sub.icon}</span>
                          <span className="submenu-text">{sub.title}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
        <div className="logout-container">
          <button className="logout-button" onClick={handleLogout}>
            <span className="menu-icon"><FiLogOut /></span>
            <span className="logout-text">Logout</span>
          </button>
        </div>
      </aside>

      <main className="admin-content">
        <div className="content-wrapper">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard