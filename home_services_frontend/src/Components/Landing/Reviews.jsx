import React, { useEffect, useState } from "react";
import axiosInstance from "../../config/axiosInstance";
import Loading from "../common/Loading";
import "./Reviews.css";

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await axiosInstance.get("/company-reviews");
        setReviews(res.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load reviews. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  if (loading) return <Loading />;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <section id="reviews" className="reviews-section">
      <h2 className="section-title">Customer Reviews</h2>
      <div className="reviews-container">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <div key={review.id} className="review-card">
              <div className="review-header">
                <div>
                  <h4 className="review-author"> {review.user ? review.user.first_name : "Anonymous"}</h4>
                  <small className="review-date">{new Date(review.created_at).toLocaleDateString()}</small>
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
          ))
        ) : (
          <p className="no-reviews">No reviews yet. Be the first to review!</p>
        )}
      </div>
    </section>
  );
};

export default Reviews;