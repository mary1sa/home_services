import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../config/axiosInstance';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import "./Register.css";

const RegisterUser = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    photo: null,
    role: 'user'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [previewImage, setPreviewImage] = useState(null);
  const navigate = useNavigate();

  const steps = [
    ['first_name', 'last_name'],
    ['email', 'password'],
    ['phone', 'address'],
    ['photo']
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePhoneChange = (value, country) => {
    setFormData({
      ...formData,
      phone: value,
      countryCode: country?.countryCode
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        photo: file
      });
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const nextStep = (e) => {
    e.preventDefault();
    const currentFields = steps[currentStep];
    const isStepValid = currentFields.every(field => {
      if (field === 'photo') return true; 
      return formData[field] !== '';
    });

    if (isStepValid) {
      setCurrentStep(currentStep + 1);
      setError('');
    } else {
      setError('Please fill all required fields before proceeding.');
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
    setError('');
  };

  const validateAllSteps = () => {
    return steps.every(stepFields => 
      stepFields.every(field => {
        if (field === 'photo') return true; 
        return formData[field] !== '';
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
        if (formData[key] !== null && formData[key] !== undefined) {
          formDataToSend.append(key, formData[key]);
        }
      });

      const response = await axiosInstance.post('register-user', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('newUser', 'true');
      navigate('/');
    } catch (err) {
      if (err.response?.data?.errors) {
        const errors = err.response.data.errors;
        const firstError = Object.values(errors)[0][0];
        setError(firstError);
      } else {
        setError('Registration failed. Please try again.');
      }
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
            case 'address':
              return (
                <div className="group-register" key={field}>
                  <label>
                    {field === 'first_name' ? 'First Name' :
                     field === 'last_name' ? 'Last Name' :
                     field === 'email' ? 'Email' : 'Address'}*
                  </label>
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
                <div className="group-register" key={field}>
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
            case 'phone':
              return (
                <div className="group-register" key={field}>
                  <label>Phone*</label>
                  <PhoneInput
                    country={'ma'}
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    inputProps={{
                      name: 'phone',
                      required: true,
                      id: 'phone-input',
                      autoComplete: 'tel'
                    }}
                    containerClass="phone-input-container"
                    inputClass="phone-input-field"
                    dropdownClass="phone-dropdown"
                    enableSearch
                    disableSearchIcon
                    placeholder="Enter phone number"
                  />
                </div>
              );
            case 'photo':
  return (
    <div className="group-register" key={field}>
      <label>Profile Photo (Optional)</label>
      <div className="image-upload-container">
        {!previewImage ? (
          <>
            <label htmlFor="photo-upload" className="upload-area">
              <div className="upload-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"></path>
                  <line x1="16" y1="5" x2="22" y2="5"></line>
                  <line x1="19" y1="2" x2="19" y2="8"></line>
                  <circle cx="9" cy="9" r="2"></circle>
                  <path d="M21 15l-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
                </svg>
              </div>
              <div className="upload-text">
                Click to upload
                <small>or drag and drop</small>
              </div>
            </label>
            <input
              id="photo-upload"
              className="file-input"
              type="file"
              name={field}
              onChange={handleFileChange}
              accept="image/*"
            />
          </>
        ) : (
          <div className="image-preview">
            <img src={previewImage} alt="Preview" />
            <button 
              type="button" 
              className="remove-image" 
              onClick={() => {
                setPreviewImage(null);
                setFormData({...formData, photo: null});
              }}
              title="Remove image"
            >
              ×
            </button>
          </div>
        )}
        
        {previewImage && (
          <button 
            type="button" 
            className="upload-btn"
            onClick={() => document.getElementById('photo-upload').click()}
          >
            Change Photo
          </button>
        )}
      </div>
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

export default RegisterUser;