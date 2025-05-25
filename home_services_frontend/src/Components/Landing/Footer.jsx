import React from "react";
import {
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaClock,
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
} from "react-icons/fa";
import "./Footer.css";

const Footer = ({ company, footerContent }) => {
  return (
    <footer id="footer" className="footer">
      <div className="footer-content">
        <div className="footer-main">
          <div className="footer-logo">
            {company?.logo ? (
              <img
                src={`${process.env.REACT_APP_API_URL}/storage/${company.logo}`}
                alt={`${company.name} logo`}
                loading="lazy"
              />
            ) : (
              <img src="logo.jpeg" alt="Company Logo" className="footer-logo" />
            )}
          </div>
          <h3>{company?.name || "Our Company"}</h3>
          <p className="footer-description">
            {footerContent?.content || "Quality services for all your needs"}
          </p>
        </div>

        <div className="company-info">
          <h4>Contact Us</h4>
          <div className="contact-info">
            {company?.address && (
              <p>
                <FaMapMarkerAlt className="icon" />
                {company.address}
              </p>
            )}
            {company?.phone && (
              <p>
                <FaPhone className="icon" />
                <a href={`tel:${company.phone}`}>{company.phone}</a>
              </p>
            )}
            {company?.email && (
              <p>
                <FaEnvelope className="icon" />
                <a href={`mailto:${company.email}`}>{company.email}</a>
              </p>
            )}
            {company?.working_hours && (
              <p>
                <FaClock className="icon" />
                {company.working_hours}
              </p>
            )}
          </div>
        </div>

        <div className="social-links-container">
          <h4>Follow Us</h4>
          <div className="social-links">
            {company?.facebook && (
              <a
                href={company.facebook}
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaFacebook />
              </a>
            )}
            {company?.twitter && (
              <a
                href={company.twitter}
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaTwitter />
              </a>
            )}
            {company?.instagram && (
              <a
                href={company.instagram}
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaInstagram />
              </a>
            )}
            {company?.linkedin && (
              <a
                href={company.linkedin}
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaLinkedin />
              </a>
            )}
          </div>

          <div className="newsletter">
            <h5>Subscribe to our newsletter</h5>
            <form>
              <input type="email" placeholder="Your email address" required />
              <button type="submit">Subscribe</button>
            </form>
          </div>
        </div>
      </div>

      <div className="footer-copyright">
        <p>
          © {new Date().getFullYear()} {company?.name || "Our Company"}. All
          rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
