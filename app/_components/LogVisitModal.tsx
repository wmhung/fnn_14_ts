'use client';

import { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import StarRating from './StarRating';
import 'react-datepicker/dist/react-datepicker.css';

export interface LogVisitData {
  rating: number;
  note: string;
  visitedAt: Date;
}

interface LogVisitModalProps {
  placeName: string;
  dist?: string;
  onClose: () => void;
  onSubmit: (data: LogVisitData) => Promise<void> | void;
}

export default function LogVisitModal({
  placeName,
  dist,
  onClose,
  onSubmit,
}: LogVisitModalProps) {
  const [rating, setRating] = useState(0);
  const [note, setNote] = useState('');
  const [visitedAt, setVisitedAt] = useState<Date>(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showWarn, setShowWarn] = useState(false);

  // Esc to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  async function handleSave() {
    if (!rating) {
      setShowWarn(true);
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmit({ rating, note, visitedAt });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className='fixed inset-0 z-[10010] flex items-center justify-center px-4 bg-black/50'
      onClick={onClose}
    >
      <div
        role='dialog'
        aria-modal='true'
        aria-label={`記錄造訪 ${placeName}`}
        className='w-full max-w-sm rounded-2xl bg-slate-50 dark:bg-slate-800 p-5 shadow-2xl flex flex-col gap-3'
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className='flex items-start'>
          <div>
            <h2 className='text-lg font-bold text-slate-800 dark:text-slate-50'>
              記錄造訪
            </h2>
            <p className='text-xs text-slate-400'>
              {placeName}
              {dist ? ` · ${dist}` : ''}
            </p>
          </div>
          <button
            type='button'
            onClick={onClose}
            aria-label='關閉'
            className='ml-auto text-slate-400 hover:text-slate-600 text-xl leading-none'
            disabled={isSubmitting}
          >
            ✕
          </button>
        </div>

        {/* Date */}
        <div className='flex flex-col'>
          <label className='text-xs font-bold uppercase tracking-wide text-slate-500 mb-1'>
            日期
          </label>
          <DatePicker
            className='w-full bg-slate-200 dark:bg-slate-700 dark:text-slate-50 border rounded-md p-2 text-sm'
            selected={visitedAt}
            onChange={(d: Date | null) => setVisitedAt(d ?? new Date())}
            maxDate={new Date()}
            dateFormat='dd/MM/yyyy'
          />
        </div>

        {/* Rating — required */}
        <div className='flex flex-col'>
          <label className='text-xs font-bold uppercase tracking-wide text-slate-500 mb-1'>
            評分 <span className='text-accent-600'>★ 必填</span>
          </label>
          <StarRating
            maxRating={5}
            size={32}
            onSetRating={(r) => {
              setRating(r);
              setShowWarn(false);
            }}
          />
        </div>

        {/* Note — optional */}
        <div className='flex flex-col'>
          <label className='text-xs font-bold uppercase tracking-wide text-slate-500 mb-1'>
            備註{' '}
            <span className='text-slate-400 font-medium normal-case'>
              · 選填
            </span>
          </label>
          <textarea
            className='w-full min-h-[3.5rem] bg-slate-200 dark:bg-slate-700 dark:text-slate-50 border rounded-md p-2 text-sm resize-none'
            placeholder='例如：玩了大溜滑梯、遇到朋友…'
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        {showWarn && (
          <p className='text-xs text-red-500' role='alert'>
            請先選擇評分再儲存造訪紀錄。
          </p>
        )}

        {/* Actions */}
        <div className='flex gap-3 mt-1'>
          <button
            type='button'
            onClick={onClose}
            disabled={isSubmitting}
            className='flex-1 py-2 rounded-lg border border-slate-300 text-slate-600 dark:text-slate-300'
          >
            取消
          </button>
          <button
            type='button'
            onClick={handleSave}
            disabled={isSubmitting || !rating}
            className='flex-1 py-2 rounded-lg bg-accent-600 text-slate-50 font-semibold disabled:opacity-50'
          >
            {isSubmitting ? '儲存中…' : '儲存'}
          </button>
        </div>
      </div>
    </div>
  );
}
