import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import axiosInstance from '../../config/axiosInstance';
import './ServiceCategory.css';

const ServiceCategory = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleServicesClick = (serviceId) => {
    navigate(`/services/${serviceId}/taskers`);
  };

  useEffect(() => {
    const fetchCategoryServices = async () => {
      try {
        const response = await axiosInstance.get(`/categories/${id}/services`);
        setCategory(response.data.category);
        setServices(response.data.services);
      } catch (error) {
        console.error('Error fetching category services:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryServices();
  }, [id]);

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="category-services-page">
      <button onClick={() => navigate(-1)} className="back-button">
        &larr; Back to Categories
      </button>

      {category && (
        <div className="category-header">
          <h1>{category.name} Services</h1>
          {category.description && <p>{category.description}</p>}
        </div>
      )}

      {services.length > 0 ? (
        <div className="services-container">
          <Swiper
            modules={[Navigation, Pagination]}
            slidesPerView={1}
            spaceBetween={20}
            navigation
            pagination={{ clickable: true }}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 }
            }}
          >
            {services.map((service) => (
              <SwiperSlide key={service.id}>
                <div 
                  className="service-card"
                  onClick={() => handleServicesClick(service.id)}
                >
                  {service.image && (
                    <img
                      src={`${process.env.REACT_APP_API_URL}/storage/${service.image}`}
                      alt={service.name}
                      className="service-image"
                    />
                  )}
                  <h3>{service.name}</h3>
                  <p className="service-description">{service.description}</p>
                  <p className="service-price">${service.price}</p>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      ) : (
        <div className="no-services">
          <p>No services available for this category</p>
        </div>
      )}
    </div>
  );
};

export default ServiceCategory;