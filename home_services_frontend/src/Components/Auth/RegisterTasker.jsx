import React, { useState, useEffect } from 'react';
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
    photo: null,
    services: [] // Will store {id, name, experience} objects
  });

  const [availableServices, setAvailableServices] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

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

  const steps = [
    ['first_name', 'last_name'],
    ['email', 'password'],
    ['phone', 'city', 'country'],
    ['services'], // Service selection step
    ['cin', 'certificate_police', 'certificate_police_date'],
    ['bio'],
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
      if (err.response?.status === 422) {
        // Handle Laravel validation errors
        const errors = err.response.data.errors;
        const errorMessage = Object.values(errors).flat().join('\n');
        setError(errorMessage || 'Validation failed. Please check your inputs.');
      } else {
        setError(err.response?.data?.message || 'Registration failed. Please try again.');
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
            case 'phone':
            case 'city':
            case 'country':
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
            case 'certificate_police':
            case 'photo':
              return (
                <div className="group-register" key={field}>
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