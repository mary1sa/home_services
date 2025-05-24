import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../../config/axiosInstance';
import {
  FiEye, FiCheck, FiX, FiSearch, FiCheckSquare,
  FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight
} from 'react-icons/fi';
import './Model.css';
import './Tasker.css';
import Loading from '../../common/Loading';
import DeleteConfirmation from '../../common/DeleteConfirmation';
import SuccessAlert from '../../common/alerts/SuccessAlert';
import ErrorAlert from '../../common/alerts/ErrorAlert';

const PendingTaskers = () => {
  const [pendingTaskers, setPendingTaskers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTaskers, setSelectedTaskers] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [taskersPerPage] = useState(3);
  const [totalPages, setTotalPages] = useState(1);

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectError, setRejectError] = useState('');
  const [taskerToReject, setTaskerToReject] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchPendingTaskers = async () => {
      try {
        const response = await axiosInstance.get('taskerspending');
        const validTaskers = response.data.filter(tasker => tasker.user !== null);
        setPendingTaskers(validTaskers);
        setTotalPages(Math.ceil(validTaskers.length / taskersPerPage));
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch pending taskers');
        setLoading(false);
        
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      }
    };

    fetchPendingTaskers();
  }, [navigate, taskersPerPage]);

  const filteredTaskers = pendingTaskers.filter(tasker => {
    if (!tasker.user) return false;
    
    return searchTerm === '' || 
      (tasker.user.first_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (tasker.user.last_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (tasker.city?.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  
  useEffect(() => {
    setTotalPages(Math.ceil(filteredTaskers.length / taskersPerPage));
    setCurrentPage(1);
  }, [filteredTaskers, taskersPerPage]);

  const indexOfLastTasker = currentPage * taskersPerPage;
  const indexOfFirstTasker = indexOfLastTasker - taskersPerPage;
  const currentTaskers = filteredTaskers.slice(indexOfFirstTasker, indexOfLastTasker);

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedTaskers([]);
    } else {
      setSelectedTaskers(currentTaskers.map(tasker => tasker.id));
    }
    setSelectAll(!selectAll);
  };

  const toggleTaskerSelection = (taskerId) => {
    if (selectedTaskers.includes(taskerId)) {
      setSelectedTaskers(selectedTaskers.filter(id => id !== taskerId));
    } else {
      setSelectedTaskers([...selectedTaskers, taskerId]);
    }
  };

  const handleApprove = async (taskerId) => {
    try {
      await axiosInstance.post(`taskersapprove/${taskerId}`);
      const updatedTaskers = pendingTaskers.filter(tasker => tasker.id !== taskerId);
      setPendingTaskers(updatedTaskers);
      setSelectedTaskers(selectedTaskers.filter(id => id !== taskerId));
      setSuccessMessage('Tasker approved successfully!');
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to approve tasker');
    }
  };

  const handleBulkApprove = async () => {
    if (selectedTaskers.length === 0) return;
    
    try {
      await Promise.all(
        selectedTaskers.map(taskerId => 
          axiosInstance.post(`taskersapprove/${taskerId}`)
        )
      );
      const updatedTaskers = pendingTaskers.filter(tasker => !selectedTaskers.includes(tasker.id));
      setPendingTaskers(updatedTaskers);
      setSelectedTaskers([]);
      setSelectAll(false);
      setSuccessMessage(`${selectedTaskers.length} tasker(s) approved successfully!`);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to approve taskers');
    }
  };

  const openRejectModal = (taskerId = null) => {
    setTaskerToReject(taskerId);
    setShowRejectModal(true);
    setRejectionReason('');
    setRejectError('');
  };

  const closeRejectModal = () => {
    setShowRejectModal(false);
    setTaskerToReject(null);
    setRejectionReason('');
    setRejectError('');
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setRejectError('Rejection reason is required');
      return;
    }

    try {
      const taskerId = taskerToReject || selectedTaskers[0];
      
      if (taskerToReject) {
        
        await axiosInstance.post(`taskersreject/${taskerId}`, {
          rejection_reason: rejectionReason
        });
        const updatedTaskers = pendingTaskers.filter(tasker => tasker.id !== taskerId);
        setPendingTaskers(updatedTaskers);
        setSuccessMessage('Tasker rejected successfully!');
      } else {
        
        await Promise.all(
          selectedTaskers.map(id => 
            axiosInstance.post(`taskersreject/${id}`, {
              rejection_reason: rejectionReason
            })
          )
        );
        const updatedTaskers = pendingTaskers.filter(tasker => !selectedTaskers.includes(tasker.id));
        setPendingTaskers(updatedTaskers);
        setSelectedTaskers([]);
        setSelectAll(false);
        setSuccessMessage(`${selectedTaskers.length} tasker(s) rejected successfully!`);
      }
      
      closeRejectModal();
    } catch (err) {
      setRejectError(err.response?.data?.message || 'Failed to reject tasker(s)');
    }
  };

  
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const goToFirstPage = () => paginate(1);
  const goToLastPage = () => paginate(totalPages);
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      paginate(currentPage + 1);
    }
  };
  const goToPrevPage = () => {
    if (currentPage > 1) {
      paginate(currentPage - 1);
    }
  };

  if (loading) return <Loading />;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="user-list-container">
      {/* Alerts */}
      <SuccessAlert
        message={successMessage}
        onClose={() => setSuccessMessage(null)}
      />
      <ErrorAlert
        message={errorMessage}
        onClose={() => setErrorMessage(null)}
      />

      <div className="header-section">
        <h1>Pending Taskers</h1>
      </div>
      
      <div className="search-filters-container">
        <div className="search-filters">
          <div className="search-bar">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search pending taskers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
        
        {selectedTaskers.length > 0 && (
          <>
            <button 
              onClick={handleBulkApprove}
              className="bulk-action-btn bulk-approve-btn"
            >
              <FiCheck className="icon" /> Approve Selected ({selectedTaskers.length})
            </button>
            <button 
              onClick={() => openRejectModal()}
              className="bulk-action-btn bulk-reject-btn"
            >
              <FiX className="icon" /> Reject Selected ({selectedTaskers.length})
            </button>
          </>
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
              <th>Name</th>
              <th>Email</th>
              <th>City</th>
              <th>Certificate Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentTaskers.length > 0 ? (
              currentTaskers.map((tasker) => {
                if (!tasker.user) return null;
                
                return (
                  <tr key={tasker.id} className={selectedTaskers.includes(tasker.id) ? 'selected-row' : ''}>
                    <td>
                      <label className="user-checkbox">
                        <input
                          type="checkbox"
                          checked={selectedTaskers.includes(tasker.id)}
                          onChange={() => toggleTaskerSelection(tasker.id)}
                        />
                        <FiCheck className="checkbox-icon" />
                      </label>
                    </td>
                    <td data-label="ID">{tasker.id}</td>
                    <td data-label="Name">
                      {tasker.user?.first_name || 'Unknown'} {tasker.user?.last_name || 'User'}
                    </td>
                    <td data-label="Email">{tasker.user?.email || 'No email'}</td>
                    <td data-label="City">{tasker.city || 'Unknown'}</td>
                    <td data-label="Certificate Date">
                      {tasker.certificate_police_date 
                        ? new Date(tasker.certificate_police_date).toLocaleDateString() 
                        : 'Not provided'}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <Link 
                          to={`${tasker.id}`} 
                          className="action-btn view-btn"
                          title="View Details"
                        >
                          <FiEye className="icon" />
                        </Link>
                        <button
                          onClick={() => handleApprove(tasker.id)}
                          className="action-btn approve-btn"
                          title="Approve"
                        >
                          <FiCheck className="icon" />
                        </button>
                        <button
                          onClick={() => openRejectModal(tasker.id)}
                          className="action-btn reject-btn"
                          title="Reject"
                        >
                          <FiX className="icon" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" className="no-users">
                  No pending taskers found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

        {filteredTaskers.length > taskersPerPage && (
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

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>
              {taskerToReject 
                ? 'Reject Tasker' 
                : `Reject ${selectedTaskers.length} Selected Tasker(s)`}
            </h3>
            <p>
              {taskerToReject
                ? 'Please provide a reason for rejecting this tasker:'
                : 'Please provide a reason for rejecting these taskers:'}
            </p>
            
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              rows={5}
              className="rejection-textarea"
              required
            />
            
            {rejectError && <div className="error-message">{rejectError}</div>}
            
            <div className="modal-actions">
              <button 
                onClick={closeRejectModal}
                className="cancel-btn"
              >
                Cancel
              </button>
              <button 
                onClick={handleReject}
                className="confirm-reject-btn"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingTaskers;