import React, { useEffect, useState } from 'react';
import axiosInstance from '../../config/axiosInstance';
import Loading from '../common/Loading';
import "./Footer.css";
import { 
  FaMapMarkerAlt, 
  FaPhone, 
  FaEnvelope,
  FaClock,
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
} from 'react-icons/fa';

const Footer = () => {
  const [content, setContent] = useState(null);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [contentRes, companyRes] = await Promise.all([
          axiosInstance.get('/contents'),
          axiosInstance.get('/companies/1')
        ]);

        const section = contentRes.data.find(
          item => item.section_name === 'footer' && item.status === 'active'
        );
        
        setContent(section || { content: "Default footer content" });
        setCompany(companyRes.data);
      } catch (error) {
        console.error('Error fetching footer data:', error);
        setError('Failed to load footer content');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <Loading />;

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
              <h3>{company?.name || "Our Company"}</h3>
            )}
          </div>
          <p className="footer-description">
            {content?.content || "Quality services for all your needs"}
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
              <a href={company.facebook} target="_blank" rel="noopener noreferrer">
                <FaFacebook />
              </a>
            )}
            {company?.twitter && (
              <a href={company.twitter} target="_blank" rel="noopener noreferrer">
                <FaTwitter />
              </a>
            )}
            {company?.instagram && (
              <a href={company.instagram} target="_blank" rel="noopener noreferrer">
                <FaInstagram />
              </a>
            )}
            {company?.linkedin && (
              <a href={company.linkedin} target="_blank" rel="noopener noreferrer">
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
          © {new Date().getFullYear()} {company?.name || 'Our Company'}. All rights reserved.
          {company?.terms_link && (
            <span className="legal-links">
              <a href={company.terms_link}>Terms of Service</a>
              <a href={company.privacy_link}>Privacy Policy</a>
            </span>
          )}
        </p>
      </div>
    </footer>
  );
};

export default Footer;