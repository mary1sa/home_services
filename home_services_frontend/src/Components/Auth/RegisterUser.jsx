
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../config/axiosInstance';
import "./Register.css";

const RegisterUser = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  const steps = [
    ['first_name', 'last_name'],
    ['email', 'password'],
    ['phone']
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const nextStep = (e) => {
        e.preventDefault();

    const currentFields = steps[currentStep];
    const isStepValid = currentFields.every(field => formData[field] !== '');

    if (isStepValid) {
      setCurrentStep(currentStep + 1);
      setError('');
    } else {
      setError('Please fill all fields before proceeding.');
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
    setError('');
  };

  const validateAllSteps = () => {
    return steps.every(stepFields => 
      stepFields.every(field => formData[field] !== '')
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateAllSteps()) {
      setError('Please complete all required fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axiosInstance.post('users', formData);
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      navigate('/');
    } catch (err) {
  if (err.response?.data?.errors) {
    // Laravel validation error format
    const errors = err.response.data.errors;
    const firstError = Object.values(errors)[0][0]; // First error message
    setError(firstError);
  } else {
    setError('Registration failed. Please try again.');
  }
}
 finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => {
    return (
      <div className="step-indicator-container">
        {steps.map((_, index) => (
          <React.Fragment key={index}>
            <div 
              className={`step-circle ${currentStep === index ? 'active' : ''} ${currentStep > index ? 'completed' : ''}`}
            >
              {index + 1}
            </div>
            {index < steps.length - 1 && (
              <div 
                className={`step-line ${currentStep > index ? 'completed' : ''}`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  const renderStep = () => {
    const currentFields = steps[currentStep];
    
    return (
      <div className="step-container">
        {currentFields.map(field => (
          <div className="form-group" key={field}>
            <label>
              {field === 'first_name' ? 'First Name' :
               field === 'last_name' ? 'Last Name' :
               field === 'email' ? 'Email' :
               field === 'password' ? 'Password (min 6 characters)' : 'Phone'}*
            </label>
            {field === 'password' ? (
              <input
              className='input_register'
                type="password"
                name={field}
                value={formData[field]}
                onChange={handleChange}
                required
                minLength="6"
              />
            ) : (
              <input
             className='input_register'

                type={field === 'email' ? 'email' : 'text'}
                name={field}
                value={formData[field]}
                onChange={handleChange}
                required
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="auth-container">
      <h2>Register as User</h2>
      {renderStepIndicator()}
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={currentStep === steps.length - 1 ? handleSubmit : (e) => e.preventDefault()}>
        {renderStep()}
        
        <div className="form-navigation">
          {currentStep > 0 && (
            <button 
              type="button" 
              onClick={prevStep} 
              disabled={loading}
              className="btn-prev"
            >
              ← Previous
            </button>
          )}
          
          {currentStep < steps.length - 1 ? (
            <button 
              type="button" 
              onClick={nextStep} 
              disabled={loading}
              className="btn-next"
            >
              Next →
            </button>
          ) : (
            <button 
              type="submit" 
              disabled={loading}
              className="btn-submit"
            >
              {loading ? (
                <>
                  <span className="spinner"></span> Registering...
                </>
              ) : (
                'Register'
              )}
            </button>
          )}
        </div>
      </form>

      <p className="login-link">
        Already have an account? <a href="/login">Login here</a>
      </p>
    </div>
  );
};

export default RegisterUser