import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Grid, Keyboard } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/grid";
import "./Reviews.css";

const Reviews = ({ reviews }) => {
  return (
    <section id="reviews" className="reviews-section">
      <h2 className="section-title">Customer Reviews</h2>

      {reviews.length > 0 ? (
        <Swiper
          modules={[Navigation, Pagination, Keyboard, Grid]}
          grid={{ rows: 2, fill: "row" }}
          slidesPerView={3}
          spaceBetween={20}
          navigation
          pagination={{ clickable: true }}
          keyboard={{ enabled: true }}
          allowTouchMove={true}
          simulateTouch={true}
          slideToClickedSlide={true}
          tabIndex={0}
          className="reviews-swiper"
        >
          {reviews.map((review) => (
            <SwiperSlide key={review.id}>
              <div className="review-card">
                <div className="review-header">
                  <div>
                    <h4 className="review-author">
                      {review.user ? review.user.first_name : "Anonymous"}
                    </h4>
                    <small className="review-date">
                      {new Date(review.created_at).toLocaleDateString()}
                    </small>
                  </div>
                  <div className="review-rating">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`star ${star <= review.rating ? "filled" : ""}`}
                      >
                        {star <= review.rating ? "★" : "☆"}
                      </span>
                    ))}
                  </div>
                </div>
                <p className="review-comment">{review.comment}</p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      ) : (
        <p className="no-reviews">No reviews yet. Be the first to review!</p>
      )}
    </section>
  );
};

export default Reviews;