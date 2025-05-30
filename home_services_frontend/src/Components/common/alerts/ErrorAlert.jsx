import React, { useEffect, useState } from 'react';
import './Alert.css';

const ErrorAlert = ({ message, onClose, duration = 4000 }) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!message) return;
    
    const startTime = Date.now();
    const animationFrame = requestAnimationFrame(function animate() {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, duration - elapsed);
      setProgress((remaining / duration) * 100);
      
      if (remaining > 0) {
        requestAnimationFrame(animate);
      } else {
        onClose();
      }
    });
    
    return () => cancelAnimationFrame(animationFrame);
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div className="alert alert--error">
      <div className="alert__progress" style={{ width: `${progress}%` }}>
        <div className="alert__progress-pulse"></div>
      </div>
      <div className="alert__content">
        <div className="alert__icon-container">
          <svg className="alert__icon" viewBox="0 0 24 24">
            <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          <div className="alert__icon-pulse"></div>
        </div>
        <span className="alert__message">{message}</span>
        <button className="alert__close" onClick={onClose} aria-label="Close">
          <svg viewBox="0 0 24 24">
            <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ErrorAlert;