import React, { useState, useRef, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import "./AdminDashboard.css";
import {
  FiMenu, FiHome, FiUsers, FiDollarSign, 
  FiSettings, FiLogOut, FiBell, FiSearch, 
  FiSun, FiMoon, FiChevronDown, FiChevronRight,
  FiUser, FiEdit, FiKey, FiMail, FiCreditCard, FiLock,
  FiUserPlus,
  FiList
} from 'react-icons/fi';

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [activeMenu, setActiveMenu] = useState('DashboardHome');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef(null);
  const sidebarRef = useRef(null);
  const menuToggleRef = useRef(null);
  const navigate = useNavigate();
const location = useLocation();
const currentPath = location.pathname;
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
      
      if (sidebarOpen && sidebarRef.current && !sidebarRef.current.contains(event.target) && 
          !event.target.closest('.menu-toggle')) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [sidebarOpen, isMobile]);

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
          title: " All Users", 
          path: "users",
          icon: <FiList className="submenu-icon" />
        },
        { 
          title: "Add User", 
          path: "users/create",
          icon: <FiUserPlus className="submenu-icon" />
        },
        { 
          title: "User Roles", 
          path: "roles",
          icon: <FiKey className="submenu-icon" />
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
          )} {!sidebarOpen && (
            <div className="app-name">
              <h1>Admin Panel</h1>
            </div>
          )}
        </div>

        <div className="navbar-center">
          <div className="search-bar">
            <FiSearch className="search-icon" />
            <input type="text" placeholder="Search..." />
          </div>
        </div>

        <div className="navbar-right">
          <button className="theme-toggle" onClick={toggleDarkMode}>
            {darkMode ? <FiSun /> : <FiMoon />}
          </button>
          
          <div className="notifications-wrapper">
            <button className="notifications">
              <FiBell />
              <span className="notification-badge">3</span>
            </button>
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
                <span className="notification-count">5</span>
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

export default AdminDashboard;