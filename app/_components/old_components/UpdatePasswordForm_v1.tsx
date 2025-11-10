'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updatePasswordSchema } from '../_lib/userSchema';
import { updatePassword } from '../_lib/actions';
import SubmitButton from './SubmitButton';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

// Helper to convert object to FormData
function toFormData(obj) {
  const formData = new FormData();
  for (const key in obj) {
    formData.append(key, obj[key]);
  }
  return formData;
}

function UpdatePasswordForm() {
  const router = useRouter();
  const [formError, setFormError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(updatePasswordSchema),
  });

  const onSubmit = async (data) => {
    setFormError('');
    try {
      const formData = toFormData(data);
      await updatePassword(formData);
      router.push('/login');
    } catch (error) {
      console.error('Password update error:', error);
      setFormError(error.message || 'An unexpected error occurred.');
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className='px-9 py-7 bg-primary-200 rounded-sm shadow-md'
    >
      <label className='flex flex-col gap-1 py-2'>
        <input
          className='border bg-slate-50 py-1 px-3 rounded-sm shadow-md'
          type='password'
          id='password'
          placeholder='ENTER NEW PASSWORD'
          {...register('password')}
        />
        {errors.password && (
          <span className='text-red-500 text-sm'>
            {errors.password.message}
          </span>
        )}
      </label>

      <label className='flex flex-col gap-1 py-2'>
        <input
          className='border bg-slate-50 py-1 px-3 rounded-sm shadow-md'
          type='password'
          id='confirmPassword'
          placeholder='CONFIRM NEW PASSWORD'
          {...register('confirmPassword')}
        />
        {errors.confirmPassword && (
          <span className='text-red-500 text-sm'>
            {errors.confirmPassword.message}
          </span>
        )}
      </label>

      {formError && <p className='text-red-500 text-sm py-2'>{formError}</p>}

      <div className='flex flex-col gap-1 py-2'>
        <SubmitButton
          className='flex justify-center items-center
          text-base aspect-[6/1] bg-primary-800 text-slate-50 w-60 mt-5 rounded-sm shadow-md'
          pendingLabel='Updating...'
        >
          Update password
        </SubmitButton>

        <Link
          href='/login'
          className='flex justify-center items-center
          text-base aspect-[6/1] bg-primary-300 text-slate-50 w-60 mt-2 rounded-sm shadow-md'
        >
          Back
        </Link>
      </div>
    </form>
  );
}

export default UpdatePasswordForm;
