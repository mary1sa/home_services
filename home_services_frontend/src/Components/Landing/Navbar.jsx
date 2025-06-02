import React, { useState, useEffect } from "react";
import { Link } from "react-scroll";
import { useNavigate } from "react-router-dom";
import "./Navbar.css";
import { FaBars, FaTimes, FaUser, FaHeart, FaBell, FaShoppingBasket } from "react-icons/fa";
import axiosInstance from '../../config/axiosInstance';

const Navbar = ({ company }) => {
  const [activeLink, setActiveLink] = useState("hero");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [panierCount, setPanierCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    if (user) {
      const fetchPanierCount = async () => {
        try {
          const response = await axiosInstance.get('/paniers');
          setPanierCount(response.data.length);
        } catch (error) {
          console.error('Error fetching panier:', error);
        }
      };

      const fetchNotifications = async () => {
        try {
          const response = await axiosInstance.get('/notifications');
          setNotifications(response.data);
        } catch (error) {
          console.error('Error fetching notifications:', error);
        }
      };

      fetchPanierCount();
      fetchNotifications();
    }
  }, [user]);

  const navItems = [
    { id: "hero", text: "Home", offset: -70 },
    { id: "about", text: "About", offset: -70 },
    { id: "services", text: "Services", offset: -70 },
    { id: "reviews", text: "Reviews", offset: -70 },
    { id: "footer", text: "Contact", offset: 0 },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  const renderAuthLinks = () => {
    if (user) {
      return (
        <div className="user-profile">
          <div 
            className="dropdown-trigger" 
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <FaUser className="user-icon" />
            <span className="user-name">{user.first_name}</span>
            {panierCount > 0 && (
              <span className="panier-badge">{panierCount}</span>
            )}
          </div>
          
          {dropdownOpen && (
            <div className="dropdown-menu">
              <div className="dropdown-header">
                <h4>{user.first_name} {user.last_name}</h4>
                <p>{user.email}</p>
              </div>
              
              <div className="dropdown-section">
                <h5>Notifications</h5>
                {notifications.length > 0 ? (
                  notifications.map(notification => (
                    <div key={notification.id} className="notification-item">
                      <p>{notification.message}</p>
                      <small>
                        {new Date(notification.created_at).toLocaleString()}
                      </small>
                    </div>
                  ))
                ) : (
                  <p className="empty-message">No notifications</p>
                )}
              </div>
              
              <div className="dropdown-section">
                <h5>Panier</h5>
                <a 
                  href="/panier" 
                  className="dropdown-link"
                  onClick={() => setDropdownOpen(false)}
                >
                  <FaShoppingBasket /> View Panier ({panierCount})
                </a>
              </div>
              
              <div className="dropdown-section">
                <button 
                  onClick={() => {
                    handleLogout();
                    setDropdownOpen(false);
                  }} 
                  className="dropdown-link"
                >
                  <FaUser /> Logout
                </button>
              </div>
            </div>
          )}
        </div>
      );
    } else {
      return (
        <div className="auth-links">
          <a href="/register" className="auth-link">
            Sign Up
          </a>
          <span className="divider">/</span>
          <a href="/login" className="auth-link">
            Sign In
          </a>
        </div>
      );
    }
  };

  return (
    <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="navbar-container">
        <div className="navbar-logo">
          {company?.logo ? (
            <img
              src={`${process.env.REACT_APP_API_URL}/storage/${company.logo}`}
              alt="Company Logo"
              className="logo-image"
              loading="lazy"
            />
          ) : (
            <img src="logo.jpeg" alt="Company Logo" className="logo-image" />
          )}
        </div>

        <div 
          className="mobile-menu-icon" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <FaTimes /> : <FaBars />}
        </div>

        <div className={`navbar-links ${mobileMenuOpen ? "active" : ""}`}>
          <ul>
            {navItems.map((item) => (
              <li key={item.id}>
                <Link
                  to={item.id}
                  spy={true}
                  smooth={true}
                  duration={500}
                  offset={item.offset}
                  className={activeLink === item.id ? "active" : ""}
                  onSetActive={() => setActiveLink(item.id)}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.text}
                </Link>
              </li>
            ))}
          </ul>
          
          <div className="mobile-auth-links">
            <a 
              href="/register-tasker" 
              className="auth-link tasker-btn"
              onClick={() => setMobileMenuOpen(false)}
            >
              Become a Tasker
            </a>
            {renderAuthLinks()}
          </div>
        </div>

        <div className="desktop-auth-links">
          <a href="/register-tasker" className="auth-link tasker-btn">
            Become a Tasker
          </a>
          {renderAuthLinks()}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;