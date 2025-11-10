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

  return (
    <button
      type='submit'
      disabled={pending}
      className='flex justify-center items-center
 text-base aspect-[6/1] bg-primary-800 text-slate-50 w-60 mt-5 rounded-sm shadow-md'
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
