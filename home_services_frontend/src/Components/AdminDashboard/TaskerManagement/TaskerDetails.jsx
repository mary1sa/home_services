import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../../../config/axiosInstance';
import { FiEdit2, FiArrowLeft } from 'react-icons/fi';
import SuccessAlert from '../../common/alerts/SuccessAlert';
import ErrorAlert from '../../common/alerts/ErrorAlert';
import Loading from '../../common/Loading';

const TaskerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tasker, setTasker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    const fetchTasker = async () => {
      try {
        const response = await axiosInstance.get(`/taskers/${id}`);
        setTasker(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch tasker');
        setLoading(false);
      }
    };

    fetchTasker();
  }, [id]);

  if (loading) return <Loading />;

  return (
    <div>
      <SuccessAlert
        message={successMessage}
        onClose={() => setSuccessMessage(null)}
      />
      <ErrorAlert
        message={error}
        onClose={() => setError(null)}
      />

      <div>
        <button onClick={() => navigate('/admin/taskers')}>
          <FiArrowLeft /> Back to Taskers
        </button>
        <h1>Tasker Details</h1>
        <div>
          <Link to={`/admin/taskers/${id}/edit`}>
            <FiEdit2 /> Edit
          </Link>
        </div>
      </div>

      <div>
        <div>
          <div>
            <img
              src={
                tasker.photo
                  ? `http://localhost:8000/storage/${tasker.photo}`
                  : '/anony.jpg'
              }
              alt={`${tasker.user?.first_name || 'Unknown'} ${tasker.user?.last_name || 'User'}`}
            />
          </div>
          <h2>{tasker.user?.first_name} {tasker.user?.last_name}</h2>
          <p>{tasker.user?.email}</p>
          <div>{tasker.status}</div>
        </div>

        <div>
          <div>
            <h3>Basic Information</h3>
            <div>
              <span>ID:</span>
              <span>#{tasker.id}</span>
            </div>
            <div>
              <span>User ID:</span>
              <span>{tasker.user_id}</span>
            </div>
            <div>
              <span>CIN:</span>
              <span>{tasker.cin}</span>
            </div>
            <div>
              <span>Location:</span>
              <span>{tasker.city}, {tasker.country}</span>
            </div>
            <div>
              <span>Experience:</span>
              <span>{tasker.experience ? `${tasker.experience} years` : 'Not specified'}</span>
            </div>
            <div>
              <span>Online Status:</span>
              <span>{tasker.user?.is_online ? 'Online' : 'Offline'}</span>
            </div>
          </div>

          <div>
            <h3>Certificate Information</h3>
            <div>
              <span>Certificate Date:</span>
              <span>{new Date(tasker.certificate_police_date).toLocaleDateString()}</span>
            </div>
            <div>
              <span>Certificate File:</span>
              {tasker.certificate_police ? (
                <a 
                  href={`http://localhost:8000/storage/${tasker.certificate_police}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Certificate
                </a>
              ) : (
                <span>Not available</span>
              )}
            </div>
          </div>

          <div>
            <h3>Additional Information</h3>
            <div>
              <span>Bio:</span>
              <p>{tasker.bio || 'No bio provided'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskerDetails;
