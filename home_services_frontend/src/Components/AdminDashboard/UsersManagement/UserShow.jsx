import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../../config/axiosInstance';

const UserShow = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (loading) return <div className="text-center py-4">Loading...</div>;
  if (error) return <div className="text-red-500 text-center py-4">Error: {error}</div>;
  if (!user) return <div className="text-center py-4">User not found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {user.first_name} {user.last_name}
        </h1>
        <div className="space-x-2">
          <button
            onClick={() => navigate(`/admin/users/${id}/edit`)}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Edit
          </button>
          <button
            onClick={() => navigate('/admin/users')}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Back to List
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            <div className="space-y-3">
              <p><span className="font-medium">Email:</span> {user.email}</p>
              <p><span className="font-medium">Phone:</span> {user.phone}</p>
              <p><span className="font-medium">Address:</span> {user.address || '-'}</p>
              <p><span className="font-medium">Role:</span> {user.role}</p>
            </div>
          </div>

          {user.tasker && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Tasker Information</h2>
              <div className="space-y-3">
                <p><span className="font-medium">Status:</span> {user.tasker.status}</p>
                <p><span className="font-medium">City:</span> {user.tasker.city}</p>
                <p><span className="font-medium">CIN:</span> {user.tasker.cin}</p>
                <p><span className="font-medium">Police Certificate:</span> {user.tasker.certificate_police}</p>
                <p><span className="font-medium">Certificate Date:</span> {user.tasker.certificate_police_date}</p>
                <p><span className="font-medium">Bio:</span> {user.tasker.bio || '-'}</p>
                <p><span className="font-medium">Experience:</span> {user.tasker.experience || '-'}</p>
                <p><span className="font-medium">Country:</span> {user.tasker.country || '-'}</p>
                {user.tasker.photo && (
                  <div>
                    <span className="font-medium">Photo:</span>
                    <img 
                      src={`/storage/${user.tasker.photo}`} 
                      alt="Tasker" 
                      className="mt-2 w-32 h-32 object-cover rounded"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserShow;