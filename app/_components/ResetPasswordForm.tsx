'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaExclamationCircle } from 'react-icons/fa';
import { resetPasswordSchema } from '../_lib/userSchema';
import { resetPassword } from '../_lib/actions';

function toFormData(obj: Record<string, any>) {
  const fd = new FormData();
  for (const k in obj) fd.append(k, obj[k]);
  return fd;
}

const inputClass =
  'w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/30 outline-none transition dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 dark:placeholder-slate-500';

const labelClass =
  'block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1.5';

const errorClass = 'text-xs text-red-600 dark:text-red-400 mt-1';

export default function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [formError, setFormError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token },
  });

  const onSubmit = async (data: any) => {
    setFormError('');
    const res = await resetPassword(toFormData(data));
    if (res?.error) {
      setFormError(res.error);
      return;
    }
    router.push('/login?reset=1');
  };

  return (
    <div className='w-full max-w-md mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-sm ring-1 ring-gray-200 dark:ring-slate-700 p-6 sm:p-8 space-y-6'>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className='space-y-4'>
        <input type='hidden' {...register('token')} />

        {/* FORM ERROR BANNER */}
        {formError && (
          <div
            role='alert'
            className='flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:bg-red-900/30 dark:border-red-700 dark:text-red-200'
          >
            <FaExclamationCircle className='shrink-0' />
            <span>{formError}</span>
          </div>
        )}

        {/* NEW PASSWORD */}
        <div>
          <label htmlFor='password' className={labelClass}>
            New password
          </label>
          <input
            id='password'
            className={inputClass}
            type='password'
            placeholder='At least 8 characters'
            autoComplete='new-password'
            {...register('password')}
          />
          {errors.password && (
            <p className={errorClass}>{errors.password.message as string}</p>
          )}
        </div>

        {/* CONFIRM PASSWORD */}
        <div>
          <label htmlFor='confirmPassword' className={labelClass}>
            Confirm new password
          </label>
          <input
            id='confirmPassword'
            className={inputClass}
            type='password'
            placeholder='Re-enter password'
            autoComplete='new-password'
            {...register('confirmPassword')}
          />
          {errors.confirmPassword && (
            <p className={errorClass}>
              {errors.confirmPassword.message as string}
            </p>
          )}
        </div>

        {/* PRIMARY ACTION */}
        <button
          type='submit'
          disabled={isSubmitting}
          className='w-full px-6 py-2.5 rounded-lg font-medium bg-primary-700 text-white hover:bg-primary-800 shadow-sm hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed transition'
        >
          {isSubmitting ? 'Updating...' : 'Set new password'}
        </button>
      </form>

      {/* FOOTER */}
      <p className='text-sm text-center text-gray-600 dark:text-slate-400'>
        Changed your mind?{' '}
        <Link
          href='/login'
          className='font-medium text-accent-600 hover:underline dark:text-accent-400'
        >
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
