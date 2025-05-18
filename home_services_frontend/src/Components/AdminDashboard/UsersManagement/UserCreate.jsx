import React, { useState } from 'react';
import axiosInstance from '../../../config/axiosInstance';
import { useNavigate } from 'react-router-dom';

const CreateUser = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    role: 'user',
    // Tasker specific fields
    city: '',
    country: '',
    bio: '',
    experience: '',
    certificate_police_date: '',
  });
  const [files, setFiles] = useState({
    photo: null,
    cin: null,
    certificate_police: null
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const { name, files: fileList } = e.target;
    setFiles(prev => ({
      ...prev,
      [name]: fileList[0]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    const data = new FormData();
    
    // Append all form fields
    for (const key in formData) {
      if (formData[key] !== '') {
        data.append(key, formData[key]);
      }
    }
    
    // Append files
    for (const key in files) {
      if (files[key]) {
        data.append(key, files[key]);
      }
    }

    try {
      const response = await axiosInstance.post('/users', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 201) {
        navigate('/admin/users');
      }
    } catch (error) {
      if (error.response && error.response.status === 422) {
        setErrors(error.response.data.errors || {});
      } else {
        console.error('Error creating user:', error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Create New User</h1>
      
      <form onSubmit={handleSubmit} className="max-w-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">First Name*</label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
            {errors.first_name && <p className="text-red-500 text-xs">{errors.first_name}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Last Name*</label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
            {errors.last_name && <p className="text-red-500 text-xs">{errors.last_name}</p>}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Email*</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
          {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Password*</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
          {errors.password && <p className="text-red-500 text-xs">{errors.password}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Phone*</label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
          {errors.phone && <p className="text-red-500 text-xs">{errors.phone}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Address</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Role*</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="user">User</option>
            <option value="tasker">Tasker</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {formData.role === 'tasker' && (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">City*</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
              {errors.city && <p className="text-red-500 text-xs">{errors.city}</p>}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Country</label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">CIN (ID Document)*</label>
              <input
                type="file"
                name="cin"
                onChange={handleFileChange}
                className="w-full p-2 border rounded"
                accept="image/jpeg,image/png"
                required
              />
              {errors.cin && <p className="text-red-500 text-xs">{errors.cin}</p>}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Police Certificate*</label>
              <input
                type="file"
                name="certificate_police"
                onChange={handleFileChange}
                className="w-full p-2 border rounded"
                accept="image/jpeg,image/png"
                required
              />
              {errors.certificate_police && <p className="text-red-500 text-xs">{errors.certificate_police}</p>}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Certificate Date*</label>
              <input
                type="date"
                name="certificate_police_date"
                value={formData.certificate_police_date}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
              {errors.certificate_police_date && <p className="text-red-500 text-xs">{errors.certificate_police_date}</p>}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Profile Photo</label>
              <input
                type="file"
                name="photo"
                onChange={handleFileChange}
                className="w-full p-2 border rounded"
                accept="image/jpeg,image/png"
              />
              {errors.photo && <p className="text-red-500 text-xs">{errors.photo}</p>}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                rows="3"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Experience (years)</label>
              <input
                type="number"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                min="0"
              />
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-blue-300"
        >
          {isSubmitting ? 'Creating...' : 'Create User'}
        </button>
      </form>
    </div>
  );
};

export default CreateUser;