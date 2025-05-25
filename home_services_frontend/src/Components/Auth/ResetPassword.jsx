import React, { useState } from 'react';
import axiosInstance from '../../config/axiosInstance';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiLock, FiCheckCircle } from 'react-icons/fi';
import ErrorAlert from '../common/alerts/ErrorAlert';
import SuccessAlert from '../common/alerts/SuccessAlert';
import './ResetPassword.css';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== passwordConfirmation) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await axiosInstance.post('/reset-password', {
        token,
        email,
        password,
        password_confirmation: passwordConfirmation
      });

      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => navigate('/login'), 3000);
      }
    } catch (err) {
      if (err.response) {
        setError(err.response.data.message || 'Failed to reset password');
      } else {
        setError('Network error. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="rp-success">
        <div className="rp-success__card">
          <FiCheckCircle className="rp-success__icon" />
          <h2 className="rp-success__title">Password Reset Successful!</h2>
          <p className="rp-success__message">
            Your password has been updated successfully. You'll be redirected to the login page shortly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rp-modal">
      <div className="rp-modal__card">
        <div className="rp-modal__header">
          <h2 className="rp-modal__title">Reset Your Password</h2>
          <p className="rp-modal__subtitle">
            Please enter your new password below.
          </p>
        </div>

        {error && <ErrorAlert message={error} onClose={() => setError('')} />}

        <form className="rp-form" onSubmit={handleSubmit}>
          <div className="rp-form__group">
            <label htmlFor="rp-password" className="rp-form__label">
              New Password
            </label>
            <div className="rp-form__input-wrapper">
              <FiLock className="rp-form__icon" />
              <input
                id="rp-password"
                name="password"
                type="password"
                required
                minLength="6"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rp-form__input"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="rp-form__group">
            <label htmlFor="rp-password-confirm" className="rp-form__label">
              Confirm New Password
            </label>
            <div className="rp-form__input-wrapper">
              <FiLock className="rp-form__icon" />
              <input
                id="rp-password-confirm"
                name="password_confirmation"
                type="password"
                required
                minLength="6"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                className="rp-form__input"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`rp-form__submit-btn ${loading ? 'rp-form__submit-btn--loading' : ''}`}
          >
            {loading ? (
              <>
                <span className="rp-form__spinner"></span>
                Resetting...
              </>
            ) : (
              'Reset Password'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;