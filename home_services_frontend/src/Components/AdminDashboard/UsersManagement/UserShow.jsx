import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../../config/axiosInstance';
import { 
  FiEdit2, FiArrowLeft, FiUser, FiMail, FiPhone, 
  FiMapPin, FiCheckCircle, FiXCircle, FiFileText, 
  FiCalendar, FiInfo, FiGlobe, FiAward, FiClock 
} from 'react-icons/fi';
import './UserShow.css';

const UserShow = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axiosInstance.get(`/users/${id}`);
        setUser(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching user');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const renderFileLink = (filePath) => {
    if (!filePath) return '-';
    const fileName = filePath.split('/').pop();
    return (
      <a 
        href={`/storage/${filePath}`} 
        target="_blank" 
        rel="noopener noreferrer"
        className="file-link"
      >
        <FiFileText className="icon" />
        {fileName}
      </a>
    );
  };

  const renderStatusBadge = (status) => {
    const statusMap = {
      approved: { color: 'success', icon: <FiCheckCircle /> },
      pending: { color: 'warning', icon: <FiClock /> },
      rejected: { color: 'danger', icon: <FiXCircle /> },
      default: { color: 'neutral', icon: <FiInfo /> }
    };
    
    const statusConfig = statusMap[status] || statusMap.default;
    
    return (
      <span className={`badge badge--${statusConfig.color}`}>
        {statusConfig.icon}
        {status}
      </span>
    );
  };

  if (loading) return (
    <div className="profile-container">
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="profile-container">
      <div className="error-alert">
        <FiXCircle className="error-icon" />
        <p>Error: {error}</p>
      </div>
    </div>
  );
  
  if (!user) return (
    <div className="profile-container">
      <div className="not-found">
        <h2>User not found</h2>
        <button
          onClick={() => navigate('/admin/users')}
          className="btn btn-primary"
        >
          <FiArrowLeft className="icon" />
          Back to Users
        </button>
      </div>
    </div>
  );

  return (
    <div className="profile-container">
      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-identity">
          {user.photo && (
            <div className="profile-avatar">
              <img src={
                         user.photo
                            ? `http://localhost:8000/storage/${user.photo}`
                            : '/anony.jpg'
                        } alt={`${user.first_name} ${user.last_name}`} />
            </div>
          )}
          <div className="profile-meta">
            <h1 className="profile-name">
              {user.first_name} {user.last_name}
              {user.is_verified && (
                <span className="verified-badge">
                  <FiCheckCircle />
                </span>
              )}
            </h1>
            <p className="profile-role">{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</p>
            <div className="profile-stats">
              <div className="stat-item">
                <FiUser />
                <span>Joined {formatDate(user.created_at)}</span>
              </div>
              
              <div className="stat-item">
                {user.is_online ? (
                  <>
                    <FiCheckCircle className="online" />
                    <span>Online</span>
                  </>
                ) : (
                  <>
                    <FiXCircle className="offline" />
                    <span>Last seen {formatDate(user.last_active)}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      
        <div className="profile-actions">
          <button
            onClick={() => navigate(`/admin/users/${id}/edit`)}
            className="btn btn-primary"
          >
            <FiEdit2 className="icon" />
            Edit Profile
          </button>
          <button
            onClick={() => navigate('/admin/users')}
            className="btn btn-secondary"
          >
            <FiArrowLeft className="icon" />
            Back to List
          </button>
        </div>
      </div>

      {/* Profile Navigation Tabs */}
      <nav className="profile-tabs">
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`}
          onClick={() => setActiveTab('details')}
        >
          Details
        </button>
        {user.tasker && (
          <button 
            className={`tab-btn ${activeTab === 'tasker' ? 'active' : ''}`}
            onClick={() => setActiveTab('tasker')}
          >
            Tasker Profile
          </button>
        )}
      </nav>

      <div className="profile-content">
        {activeTab === 'overview' && (
          <div className="overview-grid">
            <div className="profile-card">
              <h3 className="card-title">
                <FiUser className="card-icon" />
                Personal Information
              </h3>
              <div className="info-grid">
                <div className="info-item">
                  <FiMail className="info-icon" />
                  <div>
                    <label>Email</label>
                    <p>{user.email}</p>
                  </div>
                </div>
                <div className="info-item">
                  <FiPhone className="info-icon" />
                  <div>
                    <label>Phone</label>
                    <p>{user.phone || '-'}</p>
                  </div>
                </div>
                <div className="info-item">
                  <FiMapPin className="info-icon" />
                  <div>
                    <label>Address</label>
                    <p>{user.address || '-'}</p>
                  </div>
                </div>
                <div className="info-item">
                  <FiGlobe className="info-icon" />
                  <div>
                    <label>Location</label>
                    <p>{user.city || '-'}, {user.country || '-'}</p>
                  </div>
                </div>
              </div>
            </div>

            {user.tasker && (
              <div className="profile-card">
                <h3 className="card-title">
                  <FiAward className="card-icon" />
                  Tasker Summary
                </h3>
                <div className="info-grid">
                  <div className="info-item">
                    <FiInfo className="info-icon" />
                    <div>
                      <label>Status</label>
                      {renderStatusBadge(user.tasker.status)}
                    </div>
                  </div>
                  <div className="info-item">
                    <FiCalendar className="info-icon" />
                    <div>
                      <label>Registered</label>
                      <p>{formatDate(user.tasker.created_at)}</p>
                    </div>
                  </div>
                  <div className="info-item">
                    <FiFileText className="info-icon" />
                    <div>
                      <label>Documents</label>
                      <div className="documents-list">
                        {renderFileLink(user.tasker.cin)}
                        {renderFileLink(user.tasker.certificate_police)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'details' && (
          <div className="profile-card">
            <h3 className="card-title">
              <FiInfo className="card-icon" />
              Detailed Information
            </h3>
            <div className="details-grid">
              <div className="detail-section">
                <h4>Account Details</h4>
                <div className="detail-item">
                  <label>Account Created</label>
                  <p>{formatDate(user.created_at)}</p>
                </div>
                <div className="detail-item">
                  <label>Last Updated</label>
                  <p>{formatDate(user.updated_at)}</p>
                </div>
                <div className="detail-item">
                  <label>Email Verified</label>
                  <p>{user.email_verified_at ? formatDate(user.email_verified_at) : 'Not verified'}</p>
                </div>
              </div>

              <div className="detail-section">
                <h4>Activity</h4>
                <div className="detail-item">
                  <label>Last Login</label>
                  <p>{user.last_login ? formatDate(user.last_login) : 'Never logged in'}</p>
                </div>
                <div className="detail-item">
                  <label>Status</label>
                  <p>
                    {user.is_active ? (
                      <span className="badge badge--success">Active</span>
                    ) : (
                      <span className="badge badge--danger">Inactive</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tasker' && user.tasker && (
          <div className="profile-card">
            <h3 className="card-title">
              <FiUser className="card-icon" />
              Tasker Profile
            </h3>
            
            <div className="tasker-details">
              <div className="detail-section">
                <h4>Verification</h4>
                <div className="detail-item">
                  <label>Status</label>
                  {renderStatusBadge(user.tasker.status)}
                </div>
                <div className="detail-item">
                  <label>CIN Document</label>
                  {renderFileLink(user.tasker.cin)}
                </div>
                <div className="detail-item">
                  <label>Police Certificate</label>
                  {renderFileLink(user.tasker.certificate_police)}
                </div>
                <div className="detail-item">
                  <label>Certificate Date</label>
                  <p>{formatDate(user.tasker.certificate_police_date)}</p>
                </div>
              </div>

              <div className="detail-section">
                <h4>Profile Information</h4>
                <div className="detail-item">
                  <label>Bio</label>
                  <p className="bio-text">{user.tasker.bio || 'No bio provided'}</p>
                </div>
                <div className="detail-item">
                  <label>Location</label>
                  <p>{user.tasker.city || '-'}, {user.tasker.country || '-'}</p>
                </div>
              </div>

              {user.tasker.services && user.tasker.services.length > 0 && (
                <div className="detail-section">
                  <h4>Services Offered</h4>
                  <div className="services-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Service</th>
                          <th>Experience</th>
                          <th>Hourly Rate</th>
                        </tr>
                      </thead>
                      <tbody>
                        {user.tasker.services.map(service => (
                          <tr key={service.id}>
                            <td>{service.name}</td>
                            <td>{service.pivot.experience} years</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserShow;