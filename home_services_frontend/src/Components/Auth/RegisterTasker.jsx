import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../config/axiosInstance';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import Select from 'react-select';
import countryList from 'react-select-country-list';
import "./Register.css";

const RegisterTasker = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    cin: null,
    certificate_police: null,
    certificate_police_date: '',
    bio: '',
    photo: null,
    services: [] 
  });

  const [previewFiles, setPreviewFiles] = useState({
    cin: null,
    certificate_police: null,
    photo: null
  });

  const [availableServices, setAvailableServices] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  const countries = useMemo(() => countryList().getData(), []);
  const selectedCountryOption = countries.find(c => c.label === formData.country) || null;

  // Steps configuration
  const steps = [
    ['first_name', 'last_name'],
    ['email', 'password'],
    ['phone', 'address'],
    ['city', 'country'],
    ['services'],
    ['cin', 'certificate_police', 'certificate_police_date'],
    ['bio'],
    ['photo']
  ];

  // Fetch available services
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axiosInstance.get('/services');
        setAvailableServices(response.data);
      } catch (err) {
        console.error('Failed to fetch services', err);
        setError('Failed to load services. Please refresh the page.');
      }
    };
    fetchServices();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCountryChange = (selectedOption) => {
    setFormData({
      ...formData,
      country: selectedOption ? selectedOption.label : ''
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
    const { name, files } = e.target;
    const file = files[0];
    
    if (file) {
      setFormData(prev => ({
        ...prev,
        [name]: file
      }));
      
      // Create preview for images (not for PDFs)
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewFiles(prev => ({
            ...prev,
            [name]: {
              type: 'image',
              url: reader.result
            }
          }));
        };
        reader.readAsDataURL(file);
      } else {
        setPreviewFiles(prev => ({
          ...prev,
          [name]: {
            type: 'file',
            name: file.name
          }
        }));
      }
    }
  };

  const removeFile = (fieldName) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: null
    }));
    setPreviewFiles(prev => ({
      ...prev,
      [fieldName]: null
    }));
  };

  const handleServiceSelect = (e) => {
    const selectedServiceId = e.target.value;
    if (selectedServiceId && !formData.services.some(s => s.id === selectedServiceId)) {
      const selectedService = availableServices.find(s => s.id == selectedServiceId);
      setFormData(prev => ({
        ...prev,
        services: [...prev.services, { 
          id: selectedService.id, 
          name: selectedService.name,
          experience: 0 
        }]
      }));
    }
  };

  const handleServiceExperienceChange = (serviceId, value) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.map(service => 
        service.id === serviceId 
          ? { ...service, experience: parseInt(value) || 0 } 
          : service
      )
    }));
  };

  const removeService = (serviceId) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.filter(s => s.id !== serviceId)
    }));
  };

  const nextStep = (e) => {
    e.preventDefault();

    const currentFields = steps[currentStep];
    const isStepValid = currentFields.every(field => {
      if (field === 'services') {
        return formData.services.length > 0 && 
               formData.services.every(s => !isNaN(s.experience) && s.experience >= 0);
      }
      if (field === 'cin' || field === 'certificate_police' || field === 'photo') {
        return formData[field] !== null;
      }
      return formData[field] !== '' && formData[field] !== null;
    });

    if (isStepValid) {
      setCurrentStep(currentStep + 1);
      setError('');
    } else {
      if (currentFields.includes('services')) {
        if (formData.services.length === 0) {
          setError('Please select at least one service');
        } else {
          setError('Please enter valid experience for all selected services');
        }
      } else {
        setError('Please fill all fields before proceeding.');
      }
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
    setError('');
  };

  const validateAllSteps = () => {
    return steps.every(stepFields => 
      stepFields.every(field => {
        if (field === 'services') {
          return formData.services.length > 0;
        }
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
      
      // Add all basic fields
      Object.keys(formData).forEach(key => {
        if (key !== 'services' && formData[key] !== null) {
          if (key === 'cin' || key === 'certificate_police' || key === 'photo') {
            formDataToSend.append(key, formData[key], formData[key].name);
          } else {
            formDataToSend.append(key, formData[key]);
          }
        }
      });

      // Add services with experience
      formData.services.forEach((service, index) => {
        formDataToSend.append(`services[${index}][id]`, service.id);
        formDataToSend.append(`services[${index}][experience]`, service.experience);
      });

      const response = await axiosInstance.post('register-tasker', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      navigate('/login', { state: { message: 'Registration successful! Your account is pending approval.' } });
    } catch (err) {
      console.log('Full error response:', err.response);
      if (err.response) {
        if (err.response.status === 422 && err.response.data?.errors) {
          const errors = err.response.data.errors;
          const errorMessage = Object.values(errors).flat().join('\n');
          setError(errorMessage);
        } else if (err.response.data?.message) {
          setError(err.response.data.message);
        } else {
          setError('An unexpected error occurred. Please try again.');
        }
      } else if (err.request) {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError('An error occurred. Please try again.');
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

  const renderFileUploadField = (fieldName, label, required = true) => {
    const preview = previewFiles[fieldName];
    
    return (
      <div className="group-register" key={fieldName}>
        <label>{label}{required && '*'}</label>
        <div className="image-upload-container">
          {!preview ? (
            <>
              <label htmlFor={`${fieldName}-upload`} className="upload-area">
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
                id={`${fieldName}-upload`}
                className="file-input"
                type="file"
                name={fieldName}
                onChange={handleFileChange}
                accept={fieldName === 'photo' ? "image/*" : "image/*,.pdf"}
                required={required}
              />
            </>
          ) : (
            <div className="image-preview">
              {preview.type === 'image' ? (
                <img src={preview.url} alt="Preview" />
              ) : (
                <div className="document-preview">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                  <span className="file-name">{preview.name}</span>
                </div>
              )}
              <button 
                type="button" 
                className="remove-image" 
                onClick={() => removeFile(fieldName)}
                title="Remove file"
              >
                ×
              </button>
            </div>
          )}
          
          {preview && (
            <button 
              type="button" 
              className="upload-btn"
              onClick={() => document.getElementById(`${fieldName}-upload`).click()}
            >
              Change File
            </button>
          )}
        </div>
        {fieldName === 'photo' && (
          <p className="file-hint">Recommended size: 500x500 pixels</p>
        )}
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
            case 'city':
            case 'address':
              return (
                <div className="group-register" key={field}>
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
            case 'country':
              return (
                <div className="group-register" key={field}>
                  <label>Country*</label>
                  <Select
                    options={countries}
                    value={selectedCountryOption}
                    onChange={handleCountryChange}
                    classNamePrefix="react-select"
                    className="country-select"
                    placeholder="Select a country"
                    isClearable
                    styles={{
                      control: (provided) => ({
                        ...provided,
                        minHeight: '44px',
                        borderColor: '#d1d5db',
                        '&:hover': {
                          borderColor: '#9ca3af'
                        }
                      }),
                      option: (provided, state) => ({
                        ...provided,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        backgroundColor: state.isSelected ? '#3b82f6' : state.isFocused ? '#f3f4f6' : 'white',
                        color: state.isSelected ? 'white' : 'inherit',
                      }),
                      singleValue: (provided, state) => ({
                        ...provided,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                      }),
                    }}
                    formatOptionLabel={({ label, value }) => (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img
                          loading="lazy"
                          width="20"
                          src={`https://flagcdn.com/w20/${value.toLowerCase()}.png`}
                          alt={label}
                          style={{ borderRadius: '2px' }}
                        />
                        <span>{label}</span>
                      </div>
                    )}
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
            case 'certificate_police_date':
              return (
                <div className="group-register" key={field}>
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
            case 'bio':
              return (
                <div className="group-register" key={field}>
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
              return renderFileUploadField('cin', 'ID Document (CIN)');
            case 'certificate_police':
              return renderFileUploadField('certificate_police', 'Police Certificate');
            case 'photo':
              return renderFileUploadField('photo', 'Profile Photo', false);
            case 'services':
              return (
                <div className="group-register" key={field}>
                  <label>Select Services and Add Experience*</label>
                  
                  <div className="service-selection">
                    <select
                      className="service-dropdown"
                      onChange={handleServiceSelect}
                      value=""
                    >
                      <option value="">Select a service</option>
                      {availableServices
                        .filter(service => !formData.services.some(s => s.id === service.id))
                        .map(service => (
                          <option key={service.id} value={service.id}>
                            {service.name}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="selected-services">
                    {formData.services.map(service => (
                      <div key={service.id} className="service-item">
                        <div className="service-info">
                          <span>{service.name}</span>
                          <button 
                            type="button" 
                            onClick={() => removeService(service.id)}
                            className="remove-service"
                          >
                            ×
                          </button>
                        </div>
                        <div className="service-experience">
                          <label>Years of Experience:</label>
                          <input
                            type="number"
                            value={service.experience}
                            onChange={(e) => handleServiceExperienceChange(service.id, e.target.value)}
                            min="0"
                            required
                          />
                        </div>
                      </div>
                    ))}
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