import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Keyboard } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/grid";
import "./Services.css";

const Services = ({ services }) => {
  return (
    <section id="services" className="services-section">
      <h2 className="section-title">Our Services</h2>

      {services.length > 0 ? (
        <Swiper
          modules={[Navigation, Pagination, Keyboard]}
          slidesPerView={3}
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
                <h4 className="service-title">{service.name}</h4>
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