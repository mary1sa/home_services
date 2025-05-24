import React from 'react';
import './ConfirmationModal.css';

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirmation",
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default", 
  icon = null
}) => {
  if (!isOpen) return null;

  // Variant styles
  const variantStyles = {
    default: {
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      buttonBg: "bg-blue-600 hover:bg-blue-700",
      ring: "focus:ring-blue-500"
    },
    danger: {
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      buttonBg: "bg-red-600 hover:bg-red-700",
      ring: "focus:ring-red-500"
    },
    warning: {
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600",
      buttonBg: "bg-yellow-600 hover:bg-yellow-700",
      ring: "focus:ring-yellow-500"
    },
    success: {
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      buttonBg: "bg-green-600 hover:bg-green-700",
      ring: "focus:ring-green-500"
    }
  };

  const currentVariant = variantStyles[variant] || variantStyles.default;

  return (
    <div className="cm-overlay">
      <div className="cm-modal" onClick={(e) => e.stopPropagation()}>
        <div className={`cm-icon-wrapper ${currentVariant.iconBg} ${currentVariant.iconColor}`}>
          {icon || (
            <svg
              className="cm-icon"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          )}
        </div>

        <h2 className="cm-title">{title}</h2>
        <p className="cm-description">{description}</p>

        <div className="cm-buttons">
          <button
            className="cm-btn cm-cancel"
            onClick={onClose}
            autoFocus
          >
            {cancelText}
          </button>
          <button
            className={`cm-btn cm-confirm ${currentVariant.buttonBg} ${currentVariant.ring}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;