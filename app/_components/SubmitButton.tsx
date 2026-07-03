'use client';

import { useFormStatus } from 'react-dom';
import type { ReactNode } from 'react';

interface SubmitButtonProps {
  children: ReactNode;
  pendingLabel: string;
  className?: string;
}

export default function SubmitButton({
  children,
  pendingLabel,
  className = '',
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  // Base look (color, hover, shadow)
  const baseClass =
    'flex justify-center items-center text-base bg-primary-800 text-slate-50 hover:bg-primary-500 dark:border dark:border-slate-100 dark:hover:bg-primary-500 rounded-lg shadow-md disabled:opacity-60 disabled:cursor-not-allowed transition';
  const sizingDefault = 'aspect-[6/1] w-60 mt-5';

  return (
    <button
      type='submit'
      disabled={pending}
      className={`${baseClass} ${className || sizingDefault}`}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
