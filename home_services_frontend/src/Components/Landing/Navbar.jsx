import React, { useState, useEffect } from "react";
import { Link } from "react-scroll";
import axiosInstance from "../../config/axiosInstance";
import "./Navbar.css";

const Navbar = () => {
  const [activeLink, setActiveLink] = useState("hero");
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  const navItems = [
    { id: "hero", text: "Home", offset: -70 },
    { id: "about", text: "About", offset: -70 },
    { id: "services", text: "Services", offset: -70 },
    { id: "reviews", text: "Reviews", offset: -70 },
    { id: "footer", text: "Contact", offset:0 },
  ];

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const response = await axiosInstance.get("/companies/1");
        setCompany(response.data);
      } catch (error) {
        console.error("Error fetching company data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, []);

  if (loading) return null;

  return (
    <nav className="navbar">
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
      <ul className="navbar-links">
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
            >
              {item.text}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navbar;
