import React, { useEffect, useState } from "react";
import axiosInstance from "../../config/axiosInstance";
import Loading from '../common/Loading';
import "./About.css";

const About = () => {
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const companyRes = await axiosInstance.get("/companies/1");
        setCompany(companyRes.data);
      } catch (error) {
        console.error("Error fetching company data:", error);
        setError("Failed to load company information");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <Loading />;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <section id="about" className="about-section">
      <div className="about-container">
        <div className="about-flex">
          <div className="about-content">
            <h2 className="section-title">
              <span className="title-decoration">About Us</span>
            </h2>
            <p className="company-name">{company?.name || "Our Company"}</p>
            <p className="company-description">
              {company?.description || "Company description not available"}
            </p>
            <button className="learn-more-btn">Learn More</button>
          </div>

          <div className="about-image-wrapper">
            <img
              src="homeimg.jpeg"
              alt="About our company"
              className="about-img"
              loading="lazy"
            />
            <div className="image-overlay"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;