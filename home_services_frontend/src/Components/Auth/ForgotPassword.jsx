import React, { useState } from "react";
import axiosInstance from "../../config/axiosInstance";
import ErrorAlert from "../common/alerts/ErrorAlert";
import SuccessAlert from "../common/alerts/SuccessAlert";
import "./ForgotPassword.css";

const ForgotPassword = ({ onClose }) => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setErrors([]);

    try {
      const response = await axiosInstance.post("/forgot-password", { email });
      setMessage(
        response.data.message || "Password reset link sent to your email."
      );
    } catch (err) {
      if (err.response?.status === 422 && err.response.data.errors) {
        const validationErrors = Object.values(err.response.data.errors).flat();
        setErrors(validationErrors);
      } else if (err.response?.data?.message) {
        setErrors([err.response.data.message]);
      } else {
        setErrors(["Something went wrong. Please try again."]);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fp-modal__overlay" onClick={onClose}>
      <div className="fp-modal__container" onClick={(e) => e.stopPropagation()}>
        <div className="fp-modal__card">
          <button className="fp-modal__close-btn" onClick={onClose}>
            &times;
          </button>

          <div className="fp-modal__header">
            <h2 className="fp-modal__title">Forgot Password?</h2>
            <p className="fp-modal__subtitle">
              Enter your email to receive a reset link
            </p>
          </div>

          {errors.length > 0 && (
            <ErrorAlert
              message={
                <ul style={{ paddingLeft: "1rem" }}>
                  {errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              }
              onClose={() => setErrors([])}
            />
          )}

          {message && (
            <SuccessAlert message={message} onClose={() => setMessage("")} />
          )}

          <form onSubmit={handleSubmit} className="fp-form">
            <div className="fp-form__group">
              <label htmlFor="fp-email" className="fp-form__label">
                Email Address
              </label>
              <input
                className="fp-form__input"
                id="fp-email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`fp-form__submit-btn ${
                loading ? "fp-form__submit-btn--loading" : ""
              }`}
            >
              {loading ? (
                <span className="fp-form__spinner"></span>
              ) : (
                "Send Reset Link"
              )}
            </button>
          </form>

          <div className="fp-modal__footer">
            <button onClick={onClose} className="fp-modal__back-link">
              <span className="fp-modal__back-arrow">←</span> Back to Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
