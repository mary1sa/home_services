import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../config/axiosInstance';
import {
  FiSearch, FiChevronLeft, FiChevronRight, 
  FiChevronsLeft, FiChevronsRight, FiClock
} from 'react-icons/fi';
import Loading from '../../common/Loading';
import SuccessAlert from '../../common/alerts/SuccessAlert';
import ErrorAlert from '../../common/alerts/ErrorAlert';
// import './AdminList.css';

const AdminList = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  
  // Search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [adminFilter, setAdminFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [logsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  
  const navigate = useNavigate();

 
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/admin-logs');
        setLogs(response.data);
        setFilteredLogs(response.data);
        setTotalPages(Math.ceil(response.data.length / logsPerPage));
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch admin logs');
        setLoading(false);
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      }
    };

    fetchLogs();
  }, [navigate, logsPerPage]);

  useEffect(() => {
    // Get unique actions and admins for filter dropdowns
    const uniqueActions = [...new Set(logs.map(log => log.action))];
    const uniqueAdmins = [...new Set(logs.map(log => log.admin?.id))];

    // Apply filters
    const results = logs.filter(log => {
      const matchesSearch = searchTerm === '' ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.ip_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${log.admin?.first_name} ${log.admin?.last_name}`.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesAction = actionFilter === 'all' || log.action === actionFilter;
      const matchesAdmin = adminFilter === 'all' || log.admin?.id.toString() === adminFilter;

      const matchesDate = (!dateFrom || new Date(log.created_at) >= new Date(dateFrom)) &&
                         (!dateTo || new Date(log.created_at) <= new Date(dateTo));

      return matchesSearch && matchesAction && matchesAdmin && matchesDate;
    });

    setFilteredLogs(results);
    setTotalPages(Math.ceil(results.length / logsPerPage));
    setCurrentPage(1);
  }, [searchTerm, actionFilter, adminFilter, dateFrom, dateTo, logs, logsPerPage]);

  // Get current logs for pagination
  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);

  // Pagination functions
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const goToFirstPage = () => paginate(1);
  const goToLastPage = () => paginate(totalPages);
  const goToNextPage = () => currentPage < totalPages && paginate(currentPage + 1);
  const goToPrevPage = () => currentPage > 1 && paginate(currentPage - 1);

  // Get unique actions and admins for filter dropdowns
  const uniqueActions = [...new Set(logs.map(log => log.action))];
  const uniqueAdmins = logs.reduce((acc, log) => {
    if (log.admin && !acc.some(a => a.id === log.admin.id)) {
      acc.push(log.admin);
    }
    return acc;
  }, []);

  if (loading) return <Loading />;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="admin-logs-container">
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
        <h1>Admin Activity Logs</h1>
      </div>

      <div className="search-filters-container">
        <div className="search-bar">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-group">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Actions</option>
            {uniqueActions.map(action => (
              <option key={action} value={action}>
                {action.replace(/_/g, ' ')}
              </option>
            ))}
          </select>

          <select
            value={adminFilter}
            onChange={(e) => setAdminFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Admins</option>
            {uniqueAdmins.map(admin => (
              <option key={admin.id} value={admin.id}>
                {admin.first_name} {admin.last_name}
              </option>
            ))}
          </select>

          <div className="date-filters">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="date-input"
              placeholder="From date"
            />
            <span className="date-separator">to</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="date-input"
              placeholder="To date"
            />
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="logs-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Admin</th>
              <th>Action</th>
              <th>Description</th>
              <th>IP Address</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {currentLogs.length > 0 ? (
              currentLogs.map((log) => (
                <tr key={log.id}>
                  <td>{log.id}</td>
                  <td>
                    {log.admin ? 
                      `${log.admin.first_name} ${log.admin.last_name}` : 
                      'Unknown Admin'}
                  </td>
                  <td className="capitalize">
                    {log.action.replace(/_/g, ' ')}
                  </td>
                  <td className="log-description">
                    {log.description}
                  </td>
                  <td>{log.ip_address || 'N/A'}</td>
                  <td>
                    <div className="log-date">
                      <FiClock className="clock-icon" />
                      {new Date(log.created_at).toLocaleString()}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="no-logs">
                  No logs found matching your criteria
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredLogs.length > logsPerPage && (
        <div className="pagination-container">
          <button
            onClick={goToFirstPage}
            disabled={currentPage === 1}
            className="pagination-button"
          >
            <FiChevronsLeft />
          </button>
          <button
            onClick={goToPrevPage}
            disabled={currentPage === 1}
            className="pagination-button"
          >
            <FiChevronLeft />
          </button>

          <div className="pagination-numbers">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => paginate(pageNum)}
                  className={`pagination-number ${currentPage === pageNum ? 'active' : ''}`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
            className="pagination-button"
          >
            <FiChevronRight />
          </button>
          <button
            onClick={goToLastPage}
            disabled={currentPage === totalPages}
            className="pagination-button"
          >
            <FiChevronsRight />
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminList;