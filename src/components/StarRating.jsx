import React from 'react';
import { Star } from 'lucide-react';
import './StarRating.css';

const StarRating = ({ rating, onRatingChange, readonly = false, size = 20 }) => {
  const [hoverRating, setHoverRating] = React.useState(0);

  const handleMouseEnter = (value) => {
    if (!readonly) {
      setHoverRating(value);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverRating(0);
    }
  };

  const handleClick = (value) => {
    if (!readonly) {
      onRatingChange(value);
    }
  };

  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((value) => (
        <Star
          key={value}
          size={size}
          className={`star ${
            (hoverRating || rating) >= value ? 'star-filled' : 'star-empty'
          } ${readonly ? 'star-readonly' : 'star-interactive'}`}
          onMouseEnter={() => handleMouseEnter(value)}
          onMouseLeave={handleMouseLeave}
          onClick={() => handleClick(value)}
        />
      ))}
    </div>
  );
};

export default StarRating;