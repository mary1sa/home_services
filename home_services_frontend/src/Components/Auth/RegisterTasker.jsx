import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../config/axiosInstance';
import "./Register.css";

const RegisterTasker = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    phone: '',
    city: '',
    country: '',
    cin: null,
    certificate_police: null,
    certificate_police_date: '',
    bio: '',
    experience: 0,
    photo: null
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  const steps = [
    ['first_name', 'last_name'],
    ['email', 'password'],
    ['phone', 'city', 'country'],
    ['cin', 'certificate_police', 'certificate_police_date'],
    ['bio', 'experience'],
    ['photo']
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.files[0]
    });
  };

  const nextStep = (e) => {
        e.preventDefault();

    const currentFields = steps[currentStep];
    const isStepValid = currentFields.every(field => {
      if (field === 'cin' || field === 'certificate_police' || field === 'photo') {
        return formData[field] !== null;
      }
      return formData[field] !== '' && formData[field] !== null;
    });

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
      stepFields.every(field => {
        if (field === 'cin' || field === 'certificate_police' || field === 'photo') {
          return formData[field] !== null;
        }
        return formData[field] !== '' && formData[field] !== null;
      })
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
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null) {
          formDataToSend.append(key, formData[key]);
        }
      });

      const response = await axiosInstance.post('/register-tasker', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      navigate('/login', { state: { message: 'Registration successful! Your account is pending approval.' } });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
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
        {currentFields.map(field => {
          switch(field) {
            case 'first_name':
            case 'last_name':
            case 'email':
            case 'phone':
            case 'city':
            case 'country':
              return (
                <div className="form-group" key={field}>
                  <label>{field.replace('_', ' ')}*</label>
                  <input
                                className='input_register'

                    type={field === 'email' ? 'email' : 'text'}
                    name={field}
                    value={formData[field]}
                    onChange={handleChange}
                    required
                  />
                </div>
              );
            case 'password':
              return (
                <div className="form-group" key={field}>
                  <label>Password* (min 6 characters)</label>
                  <input
                                className='input_register'

                    type="password"
                    name={field}
                    value={formData[field]}
                    onChange={handleChange}
                    required
                    minLength="6"
                  />
                </div>
              );
            case 'certificate_police_date':
              return (
                <div className="form-group" key={field}>
                  <label>Certificate Date*</label>
                  <input
                                className='input_register'

                    type="date"
                    name={field}
                    value={formData[field]}
                    onChange={handleChange}
                    required
                  />
                </div>
              );
            case 'experience':
              return (
                <div className="form-group" key={field}>
                  <label>Years of Experience</label>
                  <input
                                className='input_register'

                    type="number"
                    name={field}
                    value={formData[field]}
                    onChange={handleChange}
                    min="0"
                  />
                </div>
              );
            case 'bio':
              return (
                <div className="form-group" key={field}>
                  <label>Bio (Tell us about yourself)</label>
                  <textarea
                    name={field}
                    value={formData[field]}
                    onChange={handleChange}
                    rows="4"
                  />
                </div>
              );
            case 'cin':
            case 'certificate_police':
            case 'photo':
              return (
                <div className="form-group" key={field}>
                  <label>
                    {field === 'cin' ? 'ID Document (CIN)*' : 
                     field === 'certificate_police' ? 'Police Certificate*' : 'Profile Photo'}
                  </label>
                  <input
                                className='register_file'

                    type="file"
                    name={field}
                    onChange={handleFileChange}
                    accept="image/*,.pdf"
                    required={field !== 'photo'}
                  />
                  {field === 'photo' && (
                    <p className="file-hint">Recommended size: 500x500 pixels</p>
                  )}
                </div>
              );
            default:
              return null;
          }
        })}
      </div>
    );
  };

  return (
    <div className="auth-container">
      <h2>Register as Tasker</h2>
      {renderStepIndicator()}
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={currentStep === steps.length - 1 ? handleSubmit : (e) => e.preventDefault()} encType="multipart/form-data">
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
                  <span className="spinner"></span> Processing...
                </>
              ) : (
                'Submit Registration'
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

export default RegisterTasker;