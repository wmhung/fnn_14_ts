'use client';

import { useState } from 'react';
import StarRating from './StarRating';

function FeedbackModal({ onClose, onSubmit }) {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!rating || !review) return;

    setIsSubmitting(true);

    await onSubmit({ rating, review });

    setIsSubmitting(false);
    onClose();
  }

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 z-[10010] flex items-center justify-center px-4'>
      <div className='bg-slate-50 w-full max-w-sm rounded-2xl p-6 shadow-lg flex flex-col items-center gap-4'>
        <h2 className='text-xl font-bold text-gray-800'>
          Enjoying the experience?
        </h2>
        <p className='text-gray-600 text-center'>
          Rate and tell us what you think!
        </p>

        <StarRating maxRating={5} size={30} onSetRating={setRating} />

        <textarea
          className='w-full h-24 border border-gray-300 rounded-lg p-3 text-sm resize-none'
          placeholder='Write your thoughts here...'
          value={review}
          onChange={(e) => setReview(e.target.value)}
        />

        <div className='flex gap-3 mt-4 w-full'>
          <button
            onClick={onClose}
            className='flex-1 py-2 rounded-lg border border-gray-300 text-gray-600'
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className='flex-1 py-2 rounded-lg bg-accent-600 text-slate-50 font-semibold'
            disabled={isSubmitting || !rating || !review}
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default FeedbackModal;
