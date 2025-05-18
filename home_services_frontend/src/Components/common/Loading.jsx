import React from "react";
import "./Loading.css";

const Loading = () => {
  const companyName = "ALLO LMAALAM";
  const showLogo = true; 
  
  return (
    <div className="company-loading-container">
      <div className="loading-content">
        {showLogo && (
          <img 
src="/logo512.png"
            alt="Company Logo" 
            className="loading-logo" 
          />
        )}
        <h2 className="company-name">{companyName}</h2>
        <div className="loading-line-container">
          <div className="loading-line"></div>
        </div>
      </div>
    </div>
  );
};

export default Loading;