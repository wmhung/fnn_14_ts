'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import Link from 'next/link';
import { FaEnvelope } from 'react-icons/fa';
import { requestResetSchema } from '../_lib/userSchema';
import { requestPasswordReset } from '../_lib/actions';

function toFormData(obj: Record<string, any>) {
  const fd = new FormData();
  for (const k in obj) fd.append(k, obj[k]);
  return fd;
}

const inputClass =
  'w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/30 outline-none transition dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 dark:placeholder-slate-500';

const labelClass =
  'block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1.5';

const errorClass = 'text-xs text-red-600 dark:text-red-400 mt-1';

export default function ForgotPasswordForm() {
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(requestResetSchema) });

  const onSubmit = async (data: any) => {
    await requestPasswordReset(toFormData(data));
    setSubmittedEmail(data.email); // always success — protects against enumeration
  };

  // ─────────── SUCCESS STATE ───────────
  if (submittedEmail) {
    return (
      <div className='w-full max-w-md mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-sm ring-1 ring-gray-200 dark:ring-slate-700 p-6 sm:p-8 text-center space-y-5'>
        <div className='mx-auto flex items-center justify-center w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-900/30 ring-1 ring-inset ring-emerald-200 dark:ring-emerald-700'>
          <FaEnvelope className='w-6 h-6 text-emerald-500 dark:text-emerald-400' />
        </div>

        <div className='space-y-2'>
          <h2 className='text-lg font-semibold text-gray-900 dark:text-slate-100'>
            Check your inbox
          </h2>
          <p className='text-sm text-gray-600 dark:text-slate-300 leading-relaxed'>
            If an account with{' '}
            <span className='font-medium text-gray-900 dark:text-slate-100 break-all'>
              {submittedEmail}
            </span>{' '}
            exists, we&apos;ve sent a reset link. It can take a minute to arrive
            — check your spam folder too.
          </p>
        </div>

        <Link
          href='/login'
          className='block w-full text-center px-6 py-2.5 rounded-lg font-medium bg-accent-600 text-white hover:bg-accent-700 shadow-sm hover:shadow-md transition'
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  // ─────────── INPUT STATE ───────────
  return (
    <div className='w-full max-w-md mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-sm ring-1 ring-gray-200 dark:ring-slate-700 p-6 sm:p-8 space-y-6'>
      <p className='text-sm text-gray-600 dark:text-slate-300 leading-relaxed'>
        Enter the email address linked to your account and we&apos;ll send you a
        link to reset your password.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className='space-y-4'>
        <div>
          <label htmlFor='email' className={labelClass}>
            Email
          </label>
          <input
            id='email'
            className={inputClass}
            type='email'
            placeholder='you@example.com'
            autoComplete='username'
            {...register('email')}
          />
          {errors.email && (
            <p className={errorClass}>{errors.email.message as string}</p>
          )}
        </div>

        <button
          type='submit'
          disabled={isSubmitting}
          className='w-full px-6 py-2.5 rounded-lg font-medium bg-accent-600 text-white hover:bg-accent-700 shadow-sm hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed transition'
        >
          {isSubmitting ? 'Sending...' : 'Send reset link'}
        </button>
      </form>

      <p className='text-sm text-center text-gray-600 dark:text-slate-400'>
        Remembered it?{' '}
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
