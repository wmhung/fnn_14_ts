'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { logVisit } from '../_lib/data-service';
import LogVisitModal, { LogVisitData } from './LogVisitModal';

interface VisitsSectionProps {
  placeId: number;
  placeName: string;
  dist?: string;
  initialCount?: number;
}

export default function VisitsSection({
  placeId,
  placeName,
  dist,
  initialCount = 0,
}: VisitsSectionProps) {
  const { data: session } = useSession();
  const router = useRouter();

  const [count, setCount] = useState(initialCount);
  const [showModal, setShowModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const isEmpty = count === 0;

  async function handleSubmit({ rating, note, visitedAt }: LogVisitData) {
    const email = session?.user?.email;
    if (!email) {
      setErrorMsg('請先登入才能記錄造訪。');
      return;
    }

    try {
      // Atomic insert + counter bump in the RPC; use its returned total.
      const { visit_count } = await logVisit({
        placeId,
        email,
        rating,
        note,
        visitedAt: visitedAt.toISOString(),
      });
      setCount(visit_count); // server truth
      setShowModal(false);
      router.refresh(); // re-pull the place so other views stay in sync
    } catch (err: any) {
      console.error('Failed to log visit:', err.message);
      setErrorMsg('無法記錄造訪，請再試一次。');
    }
  }

  return (
    <div className='mx-5 my-2'>
      <h2 className='my-1 text-slate-400 text-sm uppercase dark:text-slate-500'>
        造訪紀錄
      </h2>

      <div className='flex items-center justify-between flex-wrap gap-2'>
        {isEmpty ? (
          <button
            type='button'
            onClick={() => setShowModal(true)}
            className='inline-flex items-center gap-2 rounded-full bg-accent-600 text-slate-50 font-bold text-sm px-3 py-1.5'
          >
            記錄你的第一次造訪
          </button>
        ) : (
          <span className='inline-flex items-center gap-2 rounded-full bg-accent-50 text-accent-700 border border-accent-200 font-bold text-sm px-3 py-1.5'>
            {count} 次造訪
          </span>
        )}

        {!isEmpty && (
          <button
            type='button'
            onClick={() => setShowModal(true)}
            className='inline-flex items-center gap-1 rounded-lg bg-accent-600 text-slate-50 font-bold text-sm px-3 py-2'
          >
            ＋ 記錄造訪
          </button>
        )}
      </div>

      {errorMsg && <p className='mt-1 text-xs text-red-500'>{errorMsg}</p>}

      <div className='mt-2 border-b-2 border-dotted border-slate-200 dark:border-slate-500' />

      {showModal && (
        <LogVisitModal
          placeName={placeName}
          dist={dist}
          onClose={() => setShowModal(false)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
