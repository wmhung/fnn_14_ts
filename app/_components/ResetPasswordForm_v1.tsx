'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { resetPasswordSchema } from '../_lib/userSchema';
import { resetPassword } from '../_lib/actions';

function toFormData(obj: Record<string, any>) {
  const fd = new FormData();
  for (const k in obj) fd.append(k, obj[k]);
  return fd;
}

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
    <form
      onSubmit={handleSubmit(onSubmit)}
      className='px-9 py-7 bg-primary-200 rounded-sm shadow-md'
    >
      <input type='hidden' {...register('token')} />

      <label className='flex flex-col gap-1 py-2'>
        <input
          className='border bg-slate-50 py-1 px-3 rounded-sm shadow-md'
          type='password'
          placeholder='NEW PASSWORD'
          {...register('password')}
        />
        {errors.password && (
          <span className='text-red-500 text-sm'>
            {errors.password.message as string}
          </span>
        )}
      </label>

      <label className='flex flex-col gap-1 py-2'>
        <input
          className='border bg-slate-50 py-1 px-3 rounded-sm shadow-md'
          type='password'
          placeholder='CONFIRM PASSWORD'
          {...register('confirmPassword')}
        />
        {errors.confirmPassword && (
          <span className='text-red-500 text-sm'>
            {errors.confirmPassword.message as string}
          </span>
        )}
      </label>

      {formError && <p className='text-red-500 text-sm py-2'>{formError}</p>}

      <button
        type='submit'
        disabled={isSubmitting}
        className='flex justify-center items-center text-base aspect-[6/1] bg-primary-800 text-slate-50 w-60 mt-5 rounded-sm shadow-md disabled:opacity-60'
      >
        {isSubmitting ? 'Updating...' : 'Set new password'}
      </button>
    </form>
  );
}
