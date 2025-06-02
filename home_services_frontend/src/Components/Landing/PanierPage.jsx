import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../config/axiosInstance';
import './PanierPage.css';

const PanierPage = () => {
  const [panierItems, setPanierItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPanier = async () => {
      try {
        const response = await axiosInstance.get('/paniers');
        setPanierItems(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching panier:', error);
        setError('Failed to load panier');
        setLoading(false);
      }
    };
    fetchPanier();
  }, []);

  const removeFromPanier = async (taskerId) => {
    try {
      await axiosInstance.delete(`/paniers/${taskerId}`);
      setPanierItems(prev => prev.filter(item => item.tasker_id !== taskerId));
    } catch (error) {
      console.error('Error removing from panier:', error);
    }
  };

  if (loading) return <div className="panier-loading">Loading your panier...</div>;
  if (error) return <div className="panier-error">{error}</div>;

  return (
    <div className="panier-container">
      <h1>Your Panier</h1>
      
      {panierItems.length === 0 ? (
        <div className="empty-panier">
          <p>Your panier is empty</p>
          <button 
            onClick={() => navigate('/services')}
            className="browse-services-btn"
          >
            Browse Services
          </button>
        </div>
      ) : (
        <div className="panier-items">
          {panierItems.map(item => (
            <div key={item.id} className="panier-item">
              <div className="tasker-info">
                <img 
                  src={`${process.env.REACT_APP_API_URL}/storage/${item.tasker.profile_picture}`} 
                  alt={item.user.first_name}
                  className="tasker-image"
                />
                <div className="tasker-details">
                  {/* <h3>{item.user.first_name} {item.user.last_name}</h3>
                  <p>{item.service.name}</p>
                  <p>${item.tasker.service.price}/hour</p> */}
                </div>
              </div>
              
              <div className="panier-actions">
                <button 
                  onClick={() => navigate(`/book/${item.tasker.service.id}/tasker/${item.tasker.id}`)}
                  className="book-now-btn"
                >
                  Book Now
                </button>
                <button 
                  onClick={() => removeFromPanier(item.tasker_id)}
                  className="remove-btn"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PanierPage;