import { useState } from 'react';

interface StarRatingProps {
  maxRating?: number;
  color?: string;
  size?: number;
  className?: string;
  messages?: string[];
  defaultRating?: number;
  onSetRating: (rating: number) => void;
  required?: boolean; // ✅ added for type safety
}

export default function StarRating({
  maxRating = 5,
  color = '#fcc419',
  size = 48,
  className = '',
  messages = [],
  defaultRating = 0,
  onSetRating,
}: StarRatingProps) {
  const [rating, setRating] = useState(defaultRating);
  const [tempRating, setTempRating] = useState(0);

  function handleRating(rating: number) {
    setRating(rating);
    onSetRating(rating);
  }

  const textStyle: React.CSSProperties = {
    lineHeight: '1',
    margin: '0',
    color: 'text-slate-800',
    fontSize: `${size / 1.5}px`,
  };

  return (
    <div
      style={{ display: 'flex', alignItems: 'center', gap: '16px' }}
      className={className}
    >
      <div style={{ display: 'flex', gap: '4px' }}>
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

function Star({
  onRate,
  full,
  onHoverIn,
  onHoverOut,
  color,
  size,
}: {
  onRate: () => void;
  full: boolean;
  onHoverIn: () => void;
  onHoverOut: () => void;
  color: string;
  size: number;
}) {
  const starStyle: React.CSSProperties = {
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
          <path d='M23.76 20.14s1.8 7.3 2.32 9.29c.49 1.87-1.01 1.82-1.93 1.18-.93-.63-7.05-5.71-7.05-5.71s-7.18 5.13-8.17 5.82c-.85.59-2.43.72-1.79-1.44.45-1.59 2.7-9.29 2.7-9.29S2.18 15.33 1.48 14.79c-.7-.53-.73-2.03.53-2.13 1.25-.1 9.31-.8 9.31-.8s3.13-8.67 3.55-9.82c.4-1.37 1.76-1.4 2.33-.02.45 1.11 3.96 9.83 3.96 9.83s7.63.68 8.78.78c1.26.08 1.36 1.64.54 2.3-.81.64-6.74 5.23-6.74 5.23Z' />
        </svg>
      ) : (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          fill='none'
          viewBox='0 0 32 32'
          stroke={color}
        >
          <path
            d='M17.22 2.02c.45 1.12 3.96 9.84 3.96 9.84s7.63.68 8.78.78c1.26.08 1.36 1.64.55 2.3-.82.63-6.74 5.23-6.74 5.23s1.8 7.29 2.32 9.28c.49 1.87-1.01 1.82-1.93 1.17-.93-.62-7.05-5.71-7.05-5.71s-7.18 5.13-8.16 5.82c-.86.59-2.44.72-1.8-1.43.45-1.6 2.7-9.29 2.7-9.29S2.18 15.33 1.48 14.79c-.7-.53-.73-2.03.53-2.13 1.25-.1 9.31-.8 9.31-.8s3.13-8.67 3.55-9.82c.4-1.37 1.76-1.4 2.35-.02Z'
            strokeWidth={2}
            strokeLinecap='round'
            strokeLinejoin='round'
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
