'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '../_lib/userSchema';
import { login } from '../_lib/actions';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import SignInButton from './SignInButton';
import SignInButton2 from './SignInButton2';

function LoginForm() {
  const router = useRouter();
  const [formError, setFormError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

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
        router.refresh(); // ✅ refresh layout to update session info (e.g., navbar)
        router.push('/');
      }
    } catch (error) {
      console.error('Unexpected login error:', error);
      setFormError('An unexpected error occurred.');
    }
  };

  return (
    <div className='px-9 py-7 bg-accent-100 rounded-sm shadow-2xl dark:border dark:bg-slate-700 dark:border-slate-100'>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className='flex flex-col gap-1 py-2'>
          <input
            className='border bg-slate-50 py-1 px-3 rounded-sm shadow-md'
            type='email'
            placeholder='EMAIL'
            autoComplete='username'
            {...register('email')}
          />
          {errors.email && (
            <p className='text-red-500 text-sm'>{errors.email.message}</p>
          )}
        </div>

        <div className='flex flex-col gap-1 py-2'>
          <input
            className='border bg-slate-50 py-1 px-3 rounded-sm shadow-md'
            type='password'
            placeholder='PASSWORD'
            autoComplete='current-password'
            {...register('password')}
          />
          {errors.password && (
            <p className='text-red-500 text-sm'>{errors.password.message}</p>
          )}
        </div>

        {formError && <p className='text-red-500 text-sm py-2'>{formError}</p>}

        <button
          type='submit'
          disabled={isSubmitting}
          className='flex justify-center items-center text-base aspect-[6/1] bg-accent-500 text-slate-50 w-60 mt-5 rounded-sm shadow-md disabled:opacity-60 hover:bg-accent-300'
        >
          {isSubmitting ? 'Logging in...' : 'Continue with email'}
        </button>

        <Link
          href='/register'
          className='flex justify-center items-center text-base aspect-[6/1] bg-accent-800 text-slate-50 w-60 mt-3 rounded-sm shadow-md dark:bg-accent-900 hover:bg-accent-500 dark:hover:bg-accent-500'
        >
          Sign up
        </Link>

        <div className='flex border-t-[1px] border-slate-600 dark:border-accent-600 mt-5' />
      </form>

      <SignInButton />
      <SignInButton2 />
    </div>
  );
}

export default LoginForm;
