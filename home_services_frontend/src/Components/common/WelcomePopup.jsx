import React from 'react';
import './WelcomePopup.css';

const WelcomePopup = ({ onClose }) => {
  return (
    <div className="welcome-overlay">
      <div className="welcome-modal">
        <div className="welcome-header">
          <h2>Welcome</h2>
          <button onClick={onClose} className="close-button">
            &times;
          </button>
        </div>
        
        <div className="welcome-body">
          <div className="welcome-icon">👋</div>
          <p className="welcome-text">
            Thanks for joining us! We're thrilled to have you as part of our community.
          </p>
        </div>
        
        <div className="welcome-footer">
          <button onClick={onClose} className="welcome-action-button">
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomePopup;