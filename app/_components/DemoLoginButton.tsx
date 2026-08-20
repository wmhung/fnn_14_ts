'use client';

import { useState } from 'react';
import { login } from '../_lib/actions';
import { FaArrowRight } from 'react-icons/fa';

// Keep in sync with the seeded guest account.
const DEMO = { email: 'guest@email.com', password: '12341234' };

export default function DemoLoginButton() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function run() {
    setBusy(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('email', DEMO.email);
      fd.append('password', DEMO.password);
      const res = await login(fd);
      if (res?.error) {
        setError('Demo unavailable — try again.');
        setBusy(false);
        return;
      }
      window.location.href = '/placelist';
    } catch {
      setError('Demo unavailable — try again.');
      setBusy(false);
    }
  }

  return (
    <div className='inline-flex flex-col items-center gap-1'>
      <button
        type='button'
        onClick={run}
        disabled={busy}
        className='group inline-flex items-center justify-center gap-2 border border-accent-500 text-accent-600 hover:bg-accent-500/10 px-6 py-3 rounded-lg font-medium shadow-sm transition disabled:opacity-60 disabled:cursor-not-allowed dark:text-accent-400'
      >
        {busy ? 'Signing in…' : 'Sign in as demo'}{' '}
        <FaArrowRight className='w-3.5 h-3.5 transition group-hover:translate-x-0.5' />
      </button>
      {error && (
        <span className='text-xs text-red-600 dark:text-red-400'>{error}</span>
      )}
    </div>
  );
}
