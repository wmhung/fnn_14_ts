'use client';

import { updateUser } from '../_lib/actions';
import SubmitButton from './SubmitButton';
import { useFormState } from 'react-dom';

type UpdateProfileFormProps = {
  user: {
    full_name: string;
    email: string;
    num_of_kids?: number;
    gender?: string;
    avatar?: string;
    role: 'user' | 'owner' | 'admin';
  };
};

export default function UpdateProfileForm({ user }: UpdateProfileFormProps) {
  const { full_name, email, role } = user;

  const [state, formAction] = useFormState(updateUser, {
    success: false,
    error: null,
  });

  return (
    <form
      action={formAction}
      className='w-[300px] xs:w-[400px] md:w-[450px] px-5 py-5 bg-primary-200 rounded-sm shadow-md'
    >
      {/* ✅ SUCCESS MESSAGE */}
      {state?.success && (
        <p className='text-green-600 text-center mb-3'>
          ✅ Profile updated successfully
        </p>
      )}

      {/* ❌ ERROR MESSAGE */}
      {state?.error && (
        <p className='text-red-600 text-center mb-3'>{state.error}</p>
      )}

      <div className='flex flex-col gap-[2px] py-2'>
        <label htmlFor='role' className='text-primary-700'>
          User role
        </label>
        <input
          readOnly
          value={role}
          id='role'
          name='role'
          className='border-none py-1 px-3 rounded-sm shadow-md cursor-not-allowed bg-gray-500 text-gray-400'
        />
      </div>

      <div className='flex flex-col gap-[2px] py-2'>
        <label className='text-primary-700'>Full name</label>
        <input
          disabled
          defaultValue={full_name}
          name='full_name'
          className='border-none py-1 px-3 rounded-sm shadow-md cursor-not-allowed bg-gray-500 text-gray-400'
        />
      </div>

      <div className='flex flex-col gap-[2px] py-2'>
        <label className='text-primary-700'>Email address</label>
        <input
          disabled
          defaultValue={email}
          name='email'
          className='border-none py-1 px-3 rounded-sm shadow-md cursor-not-allowed bg-gray-500 text-gray-400'
        />
      </div>

      <div className='flex flex-col gap-[2px] py-2'>
        <label htmlFor='num_of_kids' className='text-primary-700'>
          How many kids do you have?
        </label>
        <select
          id='num_of_kids'
          name='num_of_kids'
          className='border bg-slate-50 py-1 px-3 rounded-sm shadow-md'
        >
          <option value=''>Select...</option>
          <option value='1'>1</option>
          <option value='2'>2</option>
          <option value='3'>3</option>
          <option value='over3'>Over 3</option>
        </select>
      </div>

      <div className='flex flex-col gap-[2px] py-2'>
        <label htmlFor='gender' className='text-primary-700'>
          Gender
        </label>
        <select
          id='gender'
          name='gender'
          className='border bg-slate-50 py-1 px-3 rounded-sm shadow-md'
        >
          <option value=''>Select...</option>
          <option value='male'>male</option>
          <option value='female'>female</option>
          <option value='both'>male & female</option>
        </select>
      </div>

      <div className='flex flex-col gap-[2px] py-2'>
        <label className='text-primary-700'>Upload avatar</label>
        <input
          className='border-none bg-slate-50 py-1 px-3 rounded-sm shadow-md text-primary-700'
          id='avatar'
          type='file'
          name='avatar'
        />
      </div>

      <div className='flex justify-center items-center py-1'>
        <SubmitButton pendingLabel='Updating...'>
          {state?.success ? 'Done!' : 'Update profile'}
        </SubmitButton>
      </div>
    </form>
  );
}
