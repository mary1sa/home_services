import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../config/axiosInstance';
import { useNavigate, useParams } from 'react-router-dom';
import { FiUpload, FiSave, FiTrash2 } from 'react-icons/fi';
import classNames from 'classnames';
import './CategoryForm.css';

const CategoryEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageUrl: ''
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await axiosInstance.get(`/categorys/${id}`);
        const category = response.data;
        setFormData({
          name: category.name,
          description: category.description || '',
          imageUrl: category.image ? `${process.env.REACT_APP_API_URL}/storage/${category.image}` : ''
        });
        setImagePreview(category.image ? `${process.env.REACT_APP_API_URL}/storage/${category.image}` : null);
      } catch (error) {
        console.error('Error fetching category:', error);
        navigate('/admin/categorys');
      }
    };

    fetchCategory();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
   
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    const data = new FormData();
    data.append('name', formData.name);
    data.append('_method', 'PUT'); 
    if (formData.description) data.append('description', formData.description);
    if (image) data.append('image', image);

    try {
      const response = await axiosInstance.post(`/categories/${id}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        navigate('/admin/categories');
      }
    } catch (error) {
      if (error.response && error.response.status === 422) {
        setErrors(error.response.data.errors || {});
      } else {
        console.error('Error updating category:', error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      setIsDeleting(true);
      try {
        await axiosInstance.delete(`/categories/${id}`);
        navigate('/admin/categories');
      } catch (error) {
        console.error('Error deleting category:', error);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="form-container">
      <div className="form-header">
        <h1 className="form-title">Edit Category</h1>
        <p className="form-subtitle">Update the category details below</p>
      </div>
      
      <form onSubmit={handleSubmit} className="category-form">
        <div className="form-section">
          <div className="input-group">
            <label className="input-label" htmlFor="name">
              Category Name*
            </label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`input-field ${errors.name ? 'input-error' : ''}`}
              placeholder="Enter category name"
              required
            />
            {errors.name && <p className="error-text">{errors.name}</p>}
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="input-field"
              rows="4"
              placeholder="Describe this category..."
            />
          </div>

          <div className="input-group">
            <label className="input-label">
              Category Image
            </label>
            <div className="image-upload-wrapper">
              <label htmlFor="image" className="image-upload-label">
                <div className="image-upload-box">
                  {imagePreview ? (
                    <div className="image-preview">
                      <img src={imagePreview} alt="Category preview" className="image-preview-img" />
                      <div className="image-overlay">Change Image</div>
                    </div>
                  ) : (
                    <div className="image-upload-placeholder">
                      <FiUpload className="upload-icon" />
                      <span>Upload New Image</span>
                      <p className="image-upload-hint">JPG, PNG (max 2MB)</p>
                    </div>
                  )}
                </div>
                <input
                  id="image"
                  type="file"
                  name="image"
                  onChange={handleImageChange}
                  className="file-input"
                  accept="image/jpeg,image/png"
                />
              </label>
            </div>
            {formData.imageUrl && !imagePreview && (
              <div className="current-image-notice">
                Current image will be kept if no new image is uploaded.
              </div>
            )}
            {errors.image && <p className="error-text">{errors.image}</p>}
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="delete-button"
          >
            {isDeleting ? (
              <>
                <span className="spinner"></span>
                Deleting...
              </>
            ) : (
              <>
                <FiTrash2 className="button-icon" />
                Delete Category
              </>
            )}
          </button>
          <div className="action-group">
            <button
              type="button"
              onClick={() => navigate('/admin/categories')}
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
                  Saving...
                </>
              ) : (
                <>
                  <FiSave className="button-icon" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CategoryEdit;