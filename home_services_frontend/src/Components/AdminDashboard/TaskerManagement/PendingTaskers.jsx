import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../../config/axiosInstance';
import { FiEye, FiCheck, FiX, FiSearch, FiCheckSquare } from 'react-icons/fi';
import './Model.css';
import Loading from '../../common/Loading';

const PendingTaskers = () => {
  const [pendingTaskers, setPendingTaskers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTaskers, setSelectedTaskers] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectError, setRejectError] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPendingTaskers = async () => {
      try {
        const response = await axiosInstance.get('taskerspending');
        setPendingTaskers(response.data);
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
  }, [navigate]);

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedTaskers([]);
    } else {
      setSelectedTaskers(filteredTaskers.map(tasker => tasker.id));
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
      setPendingTaskers(pendingTaskers.filter(tasker => tasker.id !== taskerId));
      setSelectedTaskers(selectedTaskers.filter(id => id !== taskerId));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve tasker');
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
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve taskers');
    }
  };

  const openRejectModal = () => {
    if (selectedTaskers.length === 0) return;
    setShowRejectModal(true);
    setRejectionReason('');
    setRejectError('');
  };

  const closeRejectModal = () => {
    setShowRejectModal(false);
    setRejectionReason('');
    setRejectError('');
  };

  const handleReject = async (taskerId) => {
    try {
      await axiosInstance.post(`taskersreject/${taskerId}`, {
        rejection_reason: rejectionReason
      });
      setPendingTaskers(pendingTaskers.filter(tasker => tasker.id !== taskerId));
      setSelectedTaskers(selectedTaskers.filter(id => id !== taskerId));
    } catch (err) {
      setRejectError(err.response?.data?.message || 'Failed to reject tasker');
    }
  };

  const handleBulkReject = async () => {
    if (!rejectionReason.trim()) {
      setRejectError('Rejection reason is required');
      return;
    }

    try {
      await Promise.all(
        selectedTaskers.map(taskerId => 
          axiosInstance.post(`taskersreject/${taskerId}`, {
            rejection_reason: rejectionReason
          })
        )
      );
      const updatedTaskers = pendingTaskers.filter(tasker => !selectedTaskers.includes(tasker.id));
      setPendingTaskers(updatedTaskers);
      setSelectedTaskers([]);
      setSelectAll(false);
      closeRejectModal();
    } catch (err) {
      setRejectError(err.response?.data?.message || 'Failed to reject taskers');
    }
  };

  const filteredTaskers = pendingTaskers.filter(tasker => 
    searchTerm === '' || 
    tasker.user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tasker.user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tasker.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <Loading/>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="user-list-container">
      <h1>Pending Taskers Approval</h1>
      
      <div className="search-and-create">
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
        
        <div className="action-bar">
          {selectedTaskers.length > 0 && (
            <>
              <button 
                onClick={handleBulkApprove}
                className="bulk-action-btn bulk-approve-btn"
              >
                <FiCheck className="icon" /> Approve Selected ({selectedTaskers.length})
              </button>
              <button 
                onClick={openRejectModal}
                className="bulk-action-btn bulk-reject-btn"
              >
                <FiX className="icon" /> Reject Selected ({selectedTaskers.length})
              </button>
            </>
          )}
        </div>
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
              <th>CIN</th>
              <th>Certificate Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTaskers.map((tasker) => (
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
                <td data-label="Name">{tasker.user.first_name} {tasker.user.last_name}</td>
                <td data-label="Email">{tasker.user.email}</td>
                <td data-label="City">{tasker.city}</td>
                <td data-label="CIN">{tasker.cin}</td>
                <td data-label="Certificate Date">
                  {new Date(tasker.certificate_police_date).toLocaleDateString()}
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
                      onClick={() => {
                        setSelectedTaskers([tasker.id]);
                        openRejectModal();
                      }}
                      className="action-btn reject-btn"
                      title="Reject"
                    >
                      <FiX className="icon" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Reject {selectedTaskers.length > 1 ? 'Selected Taskers' : 'Tasker'}</h3>
            <p>Please provide a reason for rejecting {selectedTaskers.length > 1 ? 'these taskers' : 'this tasker'}:</p>
            
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
                onClick={handleBulkReject}
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