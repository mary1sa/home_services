import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../../config/axiosInstance';
import {
  FiEye, FiEdit2, FiTrash2, FiPlus, FiCheck, FiCheckSquare, FiSearch,
  FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight, FiX
} from 'react-icons/fi';
import Loading from '../../common/Loading';
import DeleteConfirmation from '../../common/DeleteConfirmation';
import SuccessAlert from '../../common/alerts/SuccessAlert';
import ErrorAlert from '../../common/alerts/ErrorAlert';

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [categoriesPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isBulkDelete, setIsBulkDelete] = useState(false);
  
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get('/categories');
        setCategories(response.data);
        setFilteredCategories(response.data);
        setTotalPages(Math.ceil(response.data.length / categoriesPerPage));
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch categories');
        setLoading(false);
        
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      }
    };

    fetchCategories();
  }, [navigate, categoriesPerPage]);

  useEffect(() => {
    const results = categories.filter(category => {
      return searchTerm === '' || 
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()));
    });
    
    setFilteredCategories(results);
    setTotalPages(Math.ceil(results.length / categoriesPerPage));
    setCurrentPage(1); 
  }, [searchTerm, categories, categoriesPerPage]);

  const indexOfLastCategory = currentPage * categoriesPerPage;
  const indexOfFirstCategory = indexOfLastCategory - categoriesPerPage;
  const currentCategories = filteredCategories.slice(indexOfFirstCategory, indexOfLastCategory);

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories(currentCategories.map(category => category.id));
    }
    setSelectAll(!selectAll);
  };

  const toggleCategorySelection = (categoryId) => {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(selectedCategories.filter(id => id !== categoryId));
    } else {
      setSelectedCategories([...selectedCategories, categoryId]);
    }
  };

  const confirmSingleDelete = (categoryId) => {
    setDeleteTarget(categoryId);
    setIsBulkDelete(false);
    setShowDeleteModal(true);
  };

  const confirmBulkDelete = () => {
    if (selectedCategories.length === 0) return;
    setIsBulkDelete(true);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    setShowDeleteModal(false);
    try {
      if (isBulkDelete) {
        await Promise.all(
          selectedCategories.map(categoryId => 
            axiosInstance.delete(`/categories/${categoryId}`)
          )
        );
        const updated = categories.filter(category => !selectedCategories.includes(category.id));
        setCategories(updated);
        setFilteredCategories(updated);
        setSelectedCategories([]);
        setSelectAll(false);
        setSuccessMessage(`${selectedCategories.length} category(s) deleted successfully.`);
      } else {
        await axiosInstance.delete(`/categories/${deleteTarget}`);
        const updated = categories.filter(category => category.id !== deleteTarget);
        setCategories(updated);
        setFilteredCategories(updated);
        setSelectedCategories(selectedCategories.filter(id => id !== deleteTarget));
        setSuccessMessage('Category deleted successfully.');
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to delete category(s)';
      setErrorMessage(errMsg);
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  };

  const openShowModal = (category) => {
    setCurrentCategory(category);
    setShowModal(true);
  };

  const closeShowModal = () => {
    setShowModal(false);
    setCurrentCategory(null);
  };

  const truncateDescription = (description, length = 20) => {
    if (!description) return 'No description';
    return description.length > length 
      ? `${description.substring(0, length)}...` 
      : description;
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const goToFirstPage = () => paginate(1);
  const goToLastPage = () => paginate(totalPages);
  const goToNextPage = () => currentPage < totalPages && paginate(currentPage + 1);
  const goToPrevPage = () => currentPage > 1 && paginate(currentPage - 1);

  if (loading) return <Loading />;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="user-list-container">
     
      <SuccessAlert
        message={successMessage}
        onClose={() => setSuccessMessage(null)}
      />
      <ErrorAlert
        message={errorMessage}
        onClose={() => setErrorMessage(null)}
      />

      <div className="header-section">
        <h1>Category Management</h1>
        <Link to="create" className="create-user-btn">
          <FiPlus className="icon" /> Create New Category
        </Link>
      </div>
      
      <div className="search-filters-container">
        <div className="search-filters">
          <div className="search-bar">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
        
        {selectedCategories.length > 0 && (
          <button 
            onClick={confirmBulkDelete}
            className="bulk-delete-btn"
          >
            <FiTrash2 className="icon" /> Delete Selected ({selectedCategories.length})
          </button>
        )}
      </div>

      <div className="table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>
                <label className="select-all-checkbox">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={toggleSelectAll}
                  />
                  <FiCheckSquare className="checkbox-icon" />
                </label>
              </th>
              <th>ID</th>
              <th>Image</th>
              <th>Name</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentCategories.length > 0 ? (
              currentCategories.map((category) => (
                <tr key={category.id} className={selectedCategories.includes(category.id) ? 'selected-row' : ''}>
                  <td>
                    <label className="category-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category.id)}
                        onChange={() => toggleCategorySelection(category.id)}
                      />
                      <FiCheck className="checkbox-icon" />
                    </label>
                  </td>
                  <td data-label="ID">#{category.id}</td>
                  <td data-label="Image">
                    <div className="profile-image-container">
                      <img
                        src={
                          category.photo
                            ? `http://localhost:8000/storage/${category.photo}`
                            : '/anony.jpg'
                        }
                        alt={category.name}
                        className="profile-image"
                      />
                    </div>
                  </td>
                  <td data-label="Name">{category.name}</td>
                  <td data-label="Description">
                    <div 
                      className="description-tooltip" 
                      title={category.description || 'No description'}
                    >
                      {truncateDescription(category.description)}
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => openShowModal(category)}
                        className="action-btn view-btn"
                        title="View"
                      >
                        <FiEye className="icon" />
                      </button>
                      <Link 
                        to={`/admin/category/${category.id}`} 
                        className="action-btn edit-btn"
                        title="Edit"
                      >
                        <FiEdit2 className="icon" />
                      </Link>
                      <button
                        onClick={() => confirmSingleDelete(category.id)}
                        className="action-btn delete-btn"
                        title="Delete"
                      >
                        <FiTrash2 className="icon" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="no-categories">
                  No categories found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Show Modal */}
      <div className={`show-modal-overlay ${showModal ? 'show-modal-active' : ''}`}>
        <div className="show-modal-content">
          <div className="show-modal-header">
            <h2>{currentCategory?.name || 'Category Details'}</h2>
            <button 
              onClick={closeShowModal}
              className="show-modal-close"
            >
              <FiX />
            </button>
          </div>
          
          <div className="show-modal-body">
            {currentCategory && (
              <div className="show-modal-service-details">
                <div className="show-modal-image-container">
                  <img
                    src={
                      currentCategory.photo
                        ? `http://localhost:8000/storage/${currentCategory.photo}`
                        : '/anony.jpg'
                    }
                    alt={currentCategory.name}
                    className="show-modal-image"
                  />
                </div>
                <div className="show-modal-info">
                  <p><strong>ID:</strong> #{currentCategory.id}</p>
                  <p><strong>Name:</strong> {currentCategory.name}</p>
                  <p><strong>Description:</strong></p>
                  <p className="show-modal-description">
                    {currentCategory.description || 'No description available'}
                  </p>
                </div>
              </div>
            )}
          </div>
          
          <div className="show-modal-footer">
            <button 
              onClick={closeShowModal}
              className="show-modal-button show-modal-close-btn"
            >
              Close
            </button>
            {currentCategory && (
              <Link 
                to={`/admin/category/${currentCategory.id}`}
                className="show-modal-button show-modal-edit-btn"
                onClick={closeShowModal}
              >
                Edit Category
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Pagination */}
      {filteredCategories.length > categoriesPerPage && (
        <div className="pagination-container">
          <nav className="pagination" aria-label="Pagination">
            <button
              onClick={goToFirstPage}
              disabled={currentPage === 1}
              className="pagination-button pagination-edge"
              aria-label="First page"
            >
              &laquo;
            </button>
            
            <button
              onClick={goToPrevPage}
              disabled={currentPage === 1}
              className="pagination-button"
              aria-label="Previous page"
            >
              &lsaquo;
            </button>

            <div className="pagination-numbers">
              {currentPage > 2 && (
                <button 
                  onClick={() => paginate(1)}
                  className={`pagination-number ${currentPage === 1 ? 'active' : ''}`}
                >
                  1
                </button>
              )}
              
              {currentPage > 3 && (
                <span className="pagination-ellipsis">&hellip;</span>
              )}
              
              {currentPage > 1 && (
                <button 
                  onClick={() => paginate(currentPage - 1)}
                  className="pagination-number"
                >
                  {currentPage - 1}
                </button>
              )}
              
              <button className="pagination-number active" aria-current="page">
                {currentPage}
              </button>
              
              {currentPage < totalPages && (
                <button 
                  onClick={() => paginate(currentPage + 1)}
                  className="pagination-number"
                >
                  {currentPage + 1}
                </button>
              )}
              
              {currentPage < totalPages - 2 && (
                <span className="pagination-ellipsis">&hellip;</span>
              )}
              
              {currentPage < totalPages - 1 && (
                <button 
                  onClick={() => paginate(totalPages)}
                  className={`pagination-number ${currentPage === totalPages ? 'active' : ''}`}
                >
                  {totalPages}
                </button>
              )}
            </div>

            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className="pagination-button"
              aria-label="Next page"
            >
              &rsaquo;
            </button>
            
            <button
              onClick={goToLastPage}
              disabled={currentPage === totalPages}
              className="pagination-button pagination-edge"
              aria-label="Last page"
            >
              &raquo;
            </button>
          </nav>
        </div>
      )}

      <DeleteConfirmation
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        itemName={isBulkDelete ? `${selectedCategories.length} categories` : 'this category'}
      />
    </div>
  );
};

export default CategoryList;