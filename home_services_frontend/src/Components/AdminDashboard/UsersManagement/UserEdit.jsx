import React, { useEffect, useState,useMemo  } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../../config/axiosInstance';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import Select from 'react-select';
import countryList from 'react-select-country-list';
import classNames from 'classnames';
import { FiUser, FiMail, FiPhone, FiMapPin, FiLock, FiCalendar, FiUpload, FiX } from 'react-icons/fi';

const UserEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    role: 'user',
    city: '',
    cin: '',
    certificate_police: '',
    certificate_police_date: '',
    bio: '',
    experience: '',
    country: '',
    photo: null,
    current_photo: null
  });

  const [files, setFiles] = useState({
    photo: null,
    cin: null,
    certificate_police: null
  });
  const [previews, setPreviews] = useState({
    photo: null,
    cin: null,
    certificate_police: null
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const countries = useMemo(() => countryList().getData(), []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axiosInstance.get(`/users/${id}`);
        const user = response.data;
        
        setFormData({
          first_name: user.first_name || '',
          last_name: user.last_name || '',
          email: user.email || '',
          password: '',
          phone: user.phone || '',
          address: user.address || '',
          role: user.role || 'user',
          city: user.tasker?.city || '',
          cin: user.tasker?.cin || '',
          certificate_police: user.tasker?.certificate_police || '',
          certificate_police_date: user.tasker?.certificate_police_date || '',
          bio: user.tasker?.bio || '',
          experience: user.tasker?.experience || '',
          country: user.tasker?.country || '',
          photo: null,
          current_photo: user.tasker?.photo || null
        });

        if (user.tasker?.photo) {
          setPreviews(prev => ({
            ...prev,
            photo: `${process.env.REACT_APP_API_URL}/storage/${user.tasker.photo}`
          }));
        }
      } catch (err) {
        console.error('Error fetching user:', err);
        setErrors({ 
          general: err.response?.data?.message || 'Error fetching user data' 
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: value 
    }));
  };

  const handleCountryChange = (selectedOption) => {
    setFormData(prev => ({
      ...prev,
      country: selectedOption ? selectedOption.label : ''
    }));
  };

  const handlePhoneChange = (value, country) => {
    setFormData(prev => ({
      ...prev,
      phone: value, 
      countryCode: country?.countryCode 
    }));
  };

  const handleFileChange = (e) => {
    const { name, files: fileList } = e.target;
    const file = fileList[0];
    
    setFiles(prev => ({
      ...prev,
      [name]: file
    }));

    if (file && file.type.match('image.*')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviews(prev => ({
          ...prev,
          [name]: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }

    
    setFormData(prev => ({
      ...prev,
      [name]: file
    }));
  };

  const removeFile = (fieldName) => {
    setFiles(prev => ({
      ...prev,
      [fieldName]: null
    }));
    setPreviews(prev => ({
      ...prev,
      [fieldName]: null
    }));
    setFormData(prev => ({
      ...prev,
      [fieldName]: null
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});
    setSuccessMessage('');

    try {
      const formDataToSend = new FormData();
      
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined && key !== 'current_photo') {
          if (key === 'certificate_police_date' && formData[key]) {
            formDataToSend.append(key, new Date(formData[key]).toISOString());
          } else {
            formDataToSend.append(key, formData[key]);
          }
        }
      });

     
      for (const key in files) {
        if (files[key]) {
          formDataToSend.append(key, files[key]);
        }
      }

      const response = await axiosInstance.put(`/users/${id}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccessMessage('User updated successfully!');
      setTimeout(() => navigate("/admin/users"), 1500);

    } catch (err) {
      console.error('Update Error:', err);
      
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setErrors({ 
          general: err.response?.data?.message || 'An error occurred while updating' 
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCountryOption = countries.find(c => c.label === formData.country) || null;

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  if (errors.general) return (
    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 max-w-4xl mx-auto mt-8">
      <p className="font-bold">Error</p>
      <p>{errors.general}</p>
      <button 
        onClick={() => window.location.reload()}
        className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Try Again
      </button>
    </div>
  );

  return (
    <div className="form-container">
      <div className="form-header">
        <h1 className="form-title">Edit User</h1>
        <p className="form-subtitle">Update the user details below</p>
      </div>
      
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="user-form">
        <div className="form-section">
          <h2 className="section-title">Basic Information</h2>
          <div className="input-grid">
            <div className="input-group">
              <label className="input-label" htmlFor="first_name">
                <FiUser className="input-icon" />
                First Name*
              </label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className={`input-field ${errors.first_name ? 'input-error' : ''}`}
                required
              />
              {errors.first_name && <p className="error-text">{errors.first_name}</p>}
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="last_name">
                <FiUser className="input-icon" />
                Last Name*
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className={`input-field ${errors.last_name ? 'input-error' : ''}`}
                required
              />
              {errors.last_name && <p className="error-text">{errors.last_name}</p>}
            </div>
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="email">
              <FiMail className="input-icon" />
              Email*
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`input-field ${errors.email ? 'input-error' : ''}`}
              required
            />
            {errors.email && <p className="error-text">{errors.email}</p>}
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="password">
              <FiLock className="input-icon" />
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="input-field"
              placeholder="Leave blank to keep current"
            />
            {errors.password && <p className="error-text">{errors.password}</p>}
          </div>

          <div className="input-group">
            <label className="input-label">
              <FiPhone className="input-icon" />
              Phone*
            </label>
            <PhoneInput
              country={'us'}
              value={formData.phone}
              onChange={handlePhoneChange}
              inputProps={{
                name: 'phone',
                required: true,
                id: 'phone-input',
                autoComplete: 'tel'
              }}
              containerClass={`phone-input-container ${errors.phone ? 'input-error' : ''}`}
              inputClass="phone-input-field"
              dropdownClass="phone-dropdown"
              enableSearch
              disableSearchIcon
            />
            {errors.phone && <p className="error-text">{errors.phone}</p>}
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="address">
              <FiMapPin className="input-icon" />
              Address
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="input-field"
            />
            {errors.address && <p className="error-text">{errors.address}</p>}
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="role">
              Role*
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="input-field"
            >
              <option value="user">User</option>
              <option value="tasker">Tasker</option>
              <option value="admin">Admin</option>
            </select>
            {errors.role && <p className="error-text">{errors.role}</p>}
          </div>
        </div>

        {formData.role === 'tasker' && (
          <div className="form-section">
            <h2 className="section-title">Tasker Information</h2>
            
            <div className="input-grid">
              <div className="input-group">
                <label className="input-label" htmlFor="city">
                  City*
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className={`input-field ${errors.city ? 'input-error' : ''}`}
                  required
                />
                {errors.city && <p className="error-text">{errors.city}</p>}
              </div>

              <div className="input-group">
                <label className="input-label" htmlFor="country">
                  Country
                </label>
                <Select
                  id="country"
                  name="country"
                  options={countries}
                  value={selectedCountryOption}
                  onChange={handleCountryChange}
                  classNamePrefix="react-select"
                  className={`country-select ${errors.country ? 'input-error' : ''}`}
                  placeholder="Select a country"
                  isClearable
                  styles={{
                    control: (provided) => ({
                      ...provided,
                      minHeight: '44px',
                      borderColor: errors.country ? '#ef4444' : '#d1d5db',
                      '&:hover': {
                        borderColor: errors.country ? '#ef4444' : '#9ca3af'
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
                {errors.country && <p className="error-text">{errors.country}</p>}
              </div>
            </div>

            <div className="input-grid">
              <div className="input-group">
                <label className="input-label" htmlFor="cin">
                  CIN (ID Document)*
                </label>
                <input
                  type="text"
                  name="cin"
                  value={formData.cin}
                  onChange={handleChange}
                  className={`input-field ${errors.cin ? 'input-error' : ''}`}
                  required
                />
                {errors.cin && <p className="error-text">{errors.cin}</p>}
              </div>

              <div className="input-group">
                <label className="input-label" htmlFor="certificate_police">
                  Police Certificate*
                </label>
                <input
                  type="text"
                  name="certificate_police"
                  value={formData.certificate_police}
                  onChange={handleChange}
                  className={`input-field ${errors.certificate_police ? 'input-error' : ''}`}
                  required
                />
                {errors.certificate_police && <p className="error-text">{errors.certificate_police}</p>}
              </div>
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="certificate_police_date">
                <FiCalendar className="input-icon" />
                Certificate Date*
              </label>
              <input
                type="date"
                name="certificate_police_date"
                value={formData.certificate_police_date}
                onChange={handleChange}
                className={`input-field ${errors.certificate_police_date ? 'input-error' : ''}`}
                required
              />
              {errors.certificate_police_date && <p className="error-text">{errors.certificate_police_date}</p>}
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="bio">
                Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                className="input-field"
                rows="4"
              />
              {errors.bio && <p className="error-text">{errors.bio}</p>}
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="experience">
                Experience (years)
              </label>
              <input
                type="number"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                className="input-field"
                min="0"
              />
              {errors.experience && <p className="error-text">{errors.experience}</p>}
            </div>

            <div className="input-group">
              <label className="input-label">
                Profile Photo
              </label>
              <div className="file-upload-wrapper">
                <label htmlFor="photo" className="file-upload-label">
                  <div className="file-upload-box">
                    {previews.photo ? (
                      <div className="file-preview">
                        <img src={previews.photo} alt="Profile preview" className="file-preview-image" />
                        <span className="file-name">{files.photo?.name || 'Selected file'}</span>
                        <button 
                          type="button" 
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile('photo');
                          }}
                          className="file-remove-button"
                        >
                          <FiX />
                        </button>
                      </div>
                    ) : formData.current_photo ? (
                      <div className="file-preview">
                        <img 
                          src={`${process.env.REACT_APP_API_URL}/storage/${formData.current_photo}`} 
                          alt="Current profile" 
                          className="file-preview-image" 
                        />
                        <span className="file-name">Current photo</span>
                      </div>
                    ) : (
                      <div className="file-upload-placeholder">
                        <FiUpload className="upload-icon" />
                        <span>Upload Profile Photo</span>
                      </div>
                    )}
                  </div>
                  <input
                    id="photo"
                    type="file"
                    name="photo"
                    onChange={handleFileChange}
                    className="file-input"
                    accept="image/*"
                  />
                </label>
              </div>
              {errors.photo && <p className="error-text">{errors.photo}</p>}
            </div>
          </div>
        )}

        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate('/admin/users')}
            className="cancel-button"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={classNames("submit-button", { "disabled-button": isSubmitting })}
          >
            {isSubmitting ? (
              <>
                <span className="spinner"></span>
                Updating...
              </>
            ) : 'Update User'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserEdit;