'use client';

import { useForm } from 'react-hook-form';
import { registerSchema } from '../_lib/userSchema';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { register as registerUser } from '../_lib/actions'; // ✅ fixed filename typo

// ✅ Infer TypeScript type from Zod schema
type RegisterData = z.infer<typeof registerSchema>;

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
      formData.append(key, String(value)); // ✅ type-safe conversion
    }

    try {
      const result = await registerUser(formData);
      if (result?.error) {
        setFormError(result.error);
      } else {
        router.push('/'); // ✅ redirect client-side after success
      }
    } catch (error: any) {
      setFormError(error.message || 'Something went wrong');
    }
  };

  return (
    <div className='px-9 py-7 bg-primary-200 rounded-sm shadow-md'>
      <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col'>
        {/* Full Name */}
        <label className='flex flex-col gap-1 py-2'>
          <input
            className='border bg-slate-50 py-1 px-3 rounded-sm shadow-md'
            type='text'
            placeholder='FULL NAME'
            {...register('full_name')}
          />
          {errors.full_name && (
            <span className='text-sm text-red-500'>
              {errors.full_name.message}
            </span>
          )}
        </label>

        {/* Email */}
        <label className='flex flex-col gap-1 py-2'>
          <input
            className='border bg-slate-50 py-1 px-3 rounded-sm shadow-md'
            type='email'
            placeholder='EMAIL'
            {...register('email')}
          />
          {errors.email && (
            <span className='text-sm text-red-500'>{errors.email.message}</span>
          )}
        </label>

        {/* Password */}
        <label className='flex flex-col gap-1 py-2'>
          <input
            className='border bg-slate-50 py-1 px-3 rounded-sm shadow-md'
            type='password'
            placeholder='PASSWORD'
            {...register('password')}
          />
          {errors.password && (
            <span className='text-sm text-red-500'>
              {errors.password.message}
            </span>
          )}
        </label>

        {/* Hidden role (default: user) */}
        <input type='hidden' value='user' {...register('role')} />

        {/* Confirm Password */}
        <label className='flex flex-col gap-1 py-2'>
          <input
            className='border bg-slate-50 py-1 px-3 rounded-sm shadow-md'
            type='password'
            placeholder='CONFIRM PASSWORD'
            {...register('confirmPassword')}
          />
          {errors.confirmPassword && (
            <span className='text-sm text-red-500'>
              {errors.confirmPassword.message}
            </span>
          )}
        </label>

        {/* Error Message */}
        {formError && (
          <div className='text-sm text-red-600 py-2'>{formError}</div>
        )}

        {/* Buttons */}
        <div className='flex flex-col gap-1 py-2'>
          <button
            type='submit'
            disabled={isSubmitting}
            className='flex justify-center items-center text-base aspect-[6/1] bg-primary-800 text-slate-50 w-60 mt-5 rounded-sm shadow-md disabled:opacity-60'
          >
            {isSubmitting ? 'Registering...' : 'Register'}
          </button>

          <Link
            href='/login'
            className='flex justify-center items-center text-base aspect-[6/1] bg-primary-300 text-slate-50 w-60 mt-2 rounded-sm shadow-md'
          >
            Back
          </Link>
        </div>
      </form>
    </div>
  );
}

export default SignupForm;
