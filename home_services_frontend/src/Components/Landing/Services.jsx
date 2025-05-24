import React, { useEffect, useState } from "react";
import axiosInstance from "../../config/axiosInstance";
import Loading from "../common/Loading";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Keyboard} from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/grid";

import "./Services.css";

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await axiosInstance.get("/services");
        setServices(res.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load services");
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

      {services.length > 0 ? (
        <Swiper
          modules={[Navigation, Pagination, Keyboard]}
          slidesPerView={4}
          spaceBetween={20}
          navigation
          pagination={{ clickable: true }}
          keyboard={{ enabled: true }}
          allowTouchMove={true}
          simulateTouch={true}
          slideToClickedSlide={true}
          tabIndex={0}
          className="services-swiper"
        >
          {services.map((service) => (
            <SwiperSlide key={service.id}>
              <div className="service-card">
                <h4 className="service-title">{service.title}</h4>
                <p className="service-description">{service.description}</p>
                <img
                  src={
                    service.image
                      ? `${process.env.REACT_APP_API_URL}/storage/${service.image}`
                      : "homeimg.jpeg"
                  }
                  alt={service.title}
                  className="service-image"
                  loading="lazy"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      ) : (
        <p>No services available</p>
      )}
    </section>
  );
};

export default Services;
