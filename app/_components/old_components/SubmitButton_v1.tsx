'use client';

import { useFormStatus } from 'react-dom';

export default function SubmitButton({ children, pendingLabel }) {
  const { pending } = useFormStatus();

  return (
    <button
      className='flex justify-center items-center
 text-base aspect-[6/1] bg-primary-800 text-slate-50 w-60 mt-5 rounded-sm shadow-md'
      disabled={pending}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
