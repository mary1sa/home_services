import React, { useEffect, useState } from 'react';
import axiosInstance from '../../config/axiosInstance';
import Loading from '../common/Loading';
import "./Services.css";

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await axiosInstance.get('/services');
        setServices(res.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load services');
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  if (loading) return <Loading />;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <section id="services" className="services-section">
      <h2 className="section-title">Our Services</h2>
      <div className="services-grid">
        {services.length > 0 ? (
          services.map(service => (
            <div key={service.id} className="service-card">
              <h4 className="service-title">{service.title}</h4>
              <p className="service-description">{service.description}</p>
              <img 
                src={service.image 
                  ? `${process.env.REACT_APP_API_URL}/storage/${service.image}`
                  : "homeimg.jpeg"}
                alt={service.title}
                className="service-image"
                loading="lazy"
              />
            </div>
          ))
        ) : (
          <p>No services available</p>
        )}
      </div>
    </section>
  );
};

export default Services;