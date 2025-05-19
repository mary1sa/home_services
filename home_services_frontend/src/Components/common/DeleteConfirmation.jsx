import React from 'react';
import './DeleteConfirmation.css';

const DeleteConfirmation = ({ isOpen, onClose, onConfirm, itemName }) => {
  if (!isOpen) return null;

  return (
    <div className="dc-overlay" onClick={onClose}>
      <div 
        className="dc-modal" 
        onClick={(e) => e.stopPropagation()} // prevent modal close on click inside
        role="dialog" 
        aria-modal="true"
        aria-labelledby="dc-title"
        aria-describedby="dc-desc"
      >
        <div className="dc-icon-wrapper">
          <svg
            className="dc-icon"
            xmlns="http://www.w3.org/2000/svg"
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>

        <h2 id="dc-title" className="dc-title">Delete Confirmation</h2>
        <p id="dc-desc" className="dc-text">
          Are you sure you want to delete <span className="dc-highlight">{itemName}</span>?<br />
          This action is <strong>irreversible</strong>!
        </p>

        <div className="dc-buttons">
          <button
            className="dc-btn dc-cancel"
            onClick={onClose}
            autoFocus
          >
            Cancel
          </button>
          <button
            className="dc-btn dc-delete"
            onClick={onConfirm}
          >
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmation;
