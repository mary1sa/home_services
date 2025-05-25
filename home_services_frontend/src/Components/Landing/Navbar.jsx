import React, { useState, useEffect } from "react";
import { Link } from "react-scroll";
import "./Navbar.css";
import { FaBars, FaTimes } from "react-icons/fa";

const Navbar = ({ company }) => {
  const [activeLink, setActiveLink] = useState("hero");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const navItems = [
    { id: "hero", text: "Home", offset: -70 },
    { id: "about", text: "About", offset: -70 },
    { id: "services", text: "Services", offset: -70 },
    { id: "reviews", text: "Reviews", offset: -70 },
    { id: "footer", text: "Contact", offset: 0 },
  ];

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
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

        <div className="mobile-menu-icon" onClick={toggleMobileMenu}>
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
            <div className="auth-links">
              <a 
                href="/register" 
                className="auth-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign Up
              </a>
              <span className="divider">/</span>
              <a 
                href="/login" 
                className="auth-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign In
              </a>
            </div>
          </div>
        </div>

        <div className="desktop-auth-links">
          <a href="/register-tasker" className="auth-link tasker-btn">
            Become a Tasker
          </a>
          <div className="auth-links">
            <a href="/register" className="auth-link">
              Sign Up
            </a>
            <span className="divider">/</span>
             <a href="/login" className="auth-link">
              Sign In
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;