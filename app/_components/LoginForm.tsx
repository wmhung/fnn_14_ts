'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '../_lib/userSchema';
import { login } from '../_lib/actions';
import { useState } from 'react';
import Link from 'next/link';
import { FaExclamationCircle } from 'react-icons/fa';
import SignInButton from './SignInButton';
import SignInButton2 from './SignInButton2';

const inputClass =
  'w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/30 outline-none transition dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 dark:placeholder-slate-500';

const labelClass =
  'block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1.5';

const errorClass = 'text-xs text-red-600 dark:text-red-400 mt-1';

function LoginForm() {
  const [formError, setFormError] = useState('');
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });
  const [demoBusy, setDemoBusy] = useState(false);

  function toFormData(obj) {
    const formData = new FormData();
    for (const key in obj) {
      formData.append(key, obj[key]);
    }
    return formData;
  }

  const onSubmit = async (data) => {
    setFormError('');
    try {
      const formData = toFormData(data);
      const result = await login(formData);

      if (result?.error) {
        setFormError(result.error);
      } else {
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Unexpected login error:', error);
      setFormError('An unexpected error occurred.');
    }
  };

  // "Sign in as demo"
  const DEMO = { email: 'guest@email.com', password: '12341234' };
  const runDemo = async () => {
    setDemoBusy(true);
    try {
      for (let i = 1; i <= DEMO.email.length; i++) {
        setValue('email', DEMO.email.slice(0, i));
        await new Promise((r) => setTimeout(r, 25));
      }
      for (let i = 1; i <= DEMO.password.length; i++) {
        setValue('password', DEMO.password.slice(0, i));
        await new Promise((r) => setTimeout(r, 25));
      }
      await new Promise((r) => setTimeout(r, 250));
      await handleSubmit(onSubmit)();
    } finally {
      setDemoBusy(false);
    }
  };

  return (
    <div className='w-full max-w-md mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-sm ring-1 ring-gray-200 dark:ring-slate-700 p-6 sm:p-8 space-y-6'>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className='space-y-4'>
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

        {/* EMAIL */}
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
          {errors.email && <p className={errorClass}>{errors.email.message}</p>}
        </div>

        {/* PASSWORD */}
        <div>
          <div className='flex items-center justify-between mb-1.5'>
            <label
              htmlFor='password'
              className='block text-sm font-medium text-gray-700 dark:text-slate-200'
            >
              Password
            </label>
            <Link
              href='/forgot-password'
              className='text-xs font-medium text-accent-600 hover:underline dark:text-accent-400'
            >
              Forgot password?
            </Link>
          </div>
          <input
            id='password'
            className={inputClass}
            type='password'
            placeholder='••••••••'
            autoComplete='current-password'
            {...register('password')}
          />
          {errors.password && (
            <p className={errorClass}>{errors.password.message}</p>
          )}
        </div>

        {/* PRIMARY ACTION */}
        <button
          type='submit'
          disabled={isSubmitting}
          className='w-full px-6 py-2.5 rounded-lg font-medium bg-accent-600 text-white hover:bg-accent-700 shadow-sm hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed transition'
        >
          {isSubmitting ? 'Signing in...' : 'Continue with email'}
        </button>

        {/* DEMO ACCESS — one-click guest login (no signup) */}
        <button
          type='button'
          onClick={runDemo}
          disabled={demoBusy || isSubmitting}
          className='w-full px-6 py-2.5 rounded-lg font-medium border border-accent-500 text-accent-600 hover:bg-accent-500/10 disabled:opacity-60 disabled:cursor-not-allowed transition dark:text-accent-400'
        >
          {demoBusy ? 'Filling demo credentials…' : 'Sign in as demo →'}
        </button>
        <p className='text-xs text-center text-gray-500 dark:text-slate-400'>
          Guest account · no signup needed
        </p>
      </form>

      {/* DIVIDER */}
      <div className='relative'>
        <div className='absolute inset-0 flex items-center'>
          <div className='w-full border-t border-gray-200 dark:border-slate-700' />
        </div>
        <div className='relative flex justify-center'>
          <span className='bg-white dark:bg-slate-900 px-2 text-xs text-gray-500 dark:text-slate-400 uppercase tracking-wider'>
            or continue with
          </span>
        </div>
      </div>

      {/* OAUTH */}
      <div className='space-y-3'>
        <SignInButton />
        <SignInButton2 />
      </div>

      {/* FOOTER */}
      <p className='text-sm text-center text-gray-600 dark:text-slate-400'>
        Don&apos;t have an account?{' '}
        <Link
          href='/register'
          className='font-medium text-accent-600 hover:underline dark:text-accent-400'
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}

export default LoginForm;
