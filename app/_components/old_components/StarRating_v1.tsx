import { useState } from 'react';
import PropTypes from 'prop-types';

const containerStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
};

const starContainerStyle = {
  display: 'flex',
  gap: '4px',
};

StarRating.propTypes = {
  maxRating: PropTypes.number,
  defaultRating: PropTypes.number,
  color: PropTypes.string,
  size: PropTypes.number,
  messages: PropTypes.array,
  className: PropTypes.string,
  setStarRating: PropTypes.func,
};

export default function StarRating({
  maxRating = 5,
  color = '#fcc419',
  size = 48,
  className = '',
  messages = [],
  defaultRating = 0,
  onSetRating,
}) {
  const [rating, setRating] = useState(defaultRating);
  const [tempRating, setTempRating] = useState(0);

  function handleRating(rating) {
    setRating(rating);
    onSetRating(rating);
  }

  const textStyle = {
    lineHeight: '1',
    margin: '0',
    color: 'text-slate-800',
    fontSize: `${size / 1.5}px`,
  };

  return (
    <div style={containerStyle} className={className}>
      <div style={starContainerStyle}>
        {Array.from({ length: maxRating }, (_, i) => (
          <Star
            key={i}
            onRate={() => handleRating(i + 1)}
            full={tempRating ? tempRating >= i + 1 : rating >= i + 1}
            onHoverIn={() => setTempRating(i + 1)}
            onHoverOut={() => setTempRating(0)}
            color={color}
            size={size}
          />
        ))}
      </div>
      <p style={textStyle}>
        {messages.length === maxRating
          ? messages[tempRating ? tempRating - 1 : rating - 1]
          : tempRating || rating || ''}
      </p>
    </div>
  );
}

function Star({ onRate, full, onHoverIn, onHoverOut, color, size }) {
  const starStyle = {
    width: `${size}px`,
    height: `${size}px`,
    display: 'block',
    cursor: 'pointer',
  };

  return (
    <span
      role='button'
      style={starStyle}
      onClick={onRate}
      onMouseEnter={onHoverIn}
      onMouseLeave={onHoverOut}
    >
      {full ? (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          viewBox='0 0 32 32'
          fill={color}
          stroke={color}
        >
          <path
            d='M23.7627 20.1418C23.7627 20.1418 25.5627 27.4428 26.0827 29.4318C26.5727 31.3018 25.0727 31.2518 24.1527 30.6128C23.1227 29.8918 16.0027 24.8018 16.0027 24.8018C16.0027 24.8018 8.82267 29.9318 7.83267 30.6218C6.98267 31.2118 5.40267 31.3418 6.04267 29.4528C6.50267 27.8628 8.75267 20.1418 8.75267 20.1418C8.75267 20.1418 2.18267 15.3318 1.48267 14.7918C0.782673 14.2618 0.752673 12.7618 2.01267 12.6528C3.26267 12.5518 11.3427 11.8628 11.3427 11.8628C11.3427 11.8628 14.4727 3.19282 14.8927 2.04182C15.3027 0.671824 16.6627 0.641824 17.2127 2.02182C17.6627 3.14182 21.1727 11.8628 21.1727 11.8628C21.1727 11.8628 28.8027 12.5418 29.9527 12.6418C31.2127 12.7218 31.3127 14.2828 30.4927 14.9128C29.6827 15.5518 23.7627 20.1418 23.7627 20.1418Z'
            fill='#FFC44D'
          />
          <path
            fill-rule='evenodd'
            clip-rule='evenodd'
            d='M17.2162 2.02159C17.6662 3.14259 21.1742 11.8636 21.1742 11.8636C21.1742 11.8636 28.8062 12.5426 29.9552 12.6386C31.2142 12.7186 31.3132 14.2796 30.4962 14.9146C29.6812 15.5466 23.7612 20.1406 23.7612 20.1406C23.7612 20.1406 25.5602 27.4376 26.0832 29.4256C26.5732 31.2986 25.0702 31.2486 24.1562 30.6096C23.1212 29.8886 16.0012 24.7966 16.0012 24.7966C16.0012 24.7966 8.8252 29.9276 7.8372 30.6176C6.9872 31.2086 5.4002 31.3376 6.0402 29.4536C6.5052 27.8636 8.7552 20.1406 8.7552 20.1406C8.7552 20.1406 2.1792 15.3286 1.4812 14.7916C0.7792 14.2556 0.7572 12.7596 2.0092 12.6526C3.2632 12.5466 11.3432 11.8636 11.3432 11.8636C11.3432 11.8636 14.4752 3.18959 14.8962 2.04259C15.3042 0.671592 16.6632 0.640592 17.2162 2.02159Z'
            stroke='#FFC44D'
            stroke-width='2'
            stroke-linecap='round'
            stroke-linejoin='round'
          />
        </svg>
      ) : (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          fill='none'
          viewBox='0 0 32 32'
          stroke={color}
        >
          <path
            fill-rule='evenodd'
            clip-rule='evenodd'
            d='M17.2162 2.02159C17.6662 3.14259 21.1742 11.8636 21.1742 11.8636C21.1742 11.8636 28.8062 12.5426 29.9552 12.6386C31.2142 12.7186 31.3132 14.2796 30.4962 14.9146C29.6812 15.5466 23.7612 20.1406 23.7612 20.1406C23.7612 20.1406 25.5602 27.4376 26.0832 29.4256C26.5732 31.2986 25.0702 31.2486 24.1562 30.6096C23.1212 29.8886 16.0012 24.7966 16.0012 24.7966C16.0012 24.7966 8.8252 29.9276 7.8372 30.6176C6.9872 31.2086 5.4002 31.3376 6.0402 29.4536C6.5052 27.8636 8.7552 20.1406 8.7552 20.1406C8.7552 20.1406 2.1792 15.3286 1.4812 14.7916C0.7792 14.2556 0.7572 12.7596 2.0092 12.6526C3.2632 12.5466 11.3432 11.8636 11.3432 11.8636C11.3432 11.8636 14.4752 3.18959 14.8962 2.04259C15.3042 0.671592 16.6632 0.640592 17.2162 2.02159Z'
            stroke='#000000 '
            stroke-width='2'
            stroke-linecap='round'
            stroke-linejoin='round'
          />
        </svg>
      )}
    </span>
  );
}

/*
FULL STAR

<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 20 20"
  fill="#000"
  stroke="#000"
>
  <path
    d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
  />
</svg>


EMPTY STAR

<svg
  xmlns="http://www.w3.org/2000/svg"
  fill="none"
  viewBox="0 0 24 24"
  stroke="#000"
>
  <path
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="{2}"
    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
  />
</svg>

*/
