'use client';

import { useForm } from 'react-hook-form';
import { registerSchema } from '../_lib/userSchema';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaExclamationCircle } from 'react-icons/fa';
import { register as registerUser } from '../_lib/actions';

// Infer TypeScript type from Zod schema
type RegisterData = z.infer<typeof registerSchema>;

const inputClass =
  'w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/30 outline-none transition dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 dark:placeholder-slate-500';

const labelClass =
  'block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1.5';

const errorClass = 'text-xs text-red-600 dark:text-red-400 mt-1';

function SignupForm() {
  const router = useRouter();
  const [formError, setFormError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterData) => {
    setFormError('');

    const formData = new FormData();
    for (const [key, value] of Object.entries(data)) {
      formData.append(key, String(value)); // type-safe conversion
    }

    try {
      const result = await registerUser(formData);
      if (result?.error) {
        setFormError(result.error);
      } else {
        router.push('/'); // redirect client-side after success
      }
    } catch (error: any) {
      setFormError(error.message || 'Something went wrong');
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

        {/* FULL NAME */}
        <div>
          <label htmlFor='full_name' className={labelClass}>
            Full name
          </label>
          <input
            id='full_name'
            className={inputClass}
            type='text'
            placeholder='Jhon Doe'
            autoComplete='name'
            {...register('full_name')}
          />
          {errors.full_name && (
            <p className={errorClass}>{errors.full_name.message}</p>
          )}
        </div>

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
            autoComplete='email'
            {...register('email')}
          />
          {errors.email && <p className={errorClass}>{errors.email.message}</p>}
        </div>

        {/* PASSWORD */}
        <div>
          <label htmlFor='password' className={labelClass}>
            Password
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
            <p className={errorClass}>{errors.password.message}</p>
          )}
        </div>

        {/* CONFIRM PASSWORD */}
        <div>
          <label htmlFor='confirmPassword' className={labelClass}>
            Confirm password
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
            <p className={errorClass}>{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* PRIMARY ACTION */}
        <button
          type='submit'
          disabled={isSubmitting}
          className='w-full px-6 py-2.5 rounded-lg font-medium bg-primary-700 text-white hover:bg-primary-800 shadow-sm hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed transition'
        >
          {isSubmitting ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      {/* FOOTER */}
      <p className='text-sm text-center text-gray-600 dark:text-slate-400'>
        Already have an account?{' '}
        <Link
          href='/login'
          className='font-medium text-accent-600 hover:underline dark:text-accent-400'
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}

export default SignupForm;
