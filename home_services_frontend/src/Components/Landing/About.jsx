import React from "react";
import "./About.css";

const About = ({ company }) => {
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