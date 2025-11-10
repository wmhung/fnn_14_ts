'use client';

import { updateUser } from '../_lib/actions';
import SubmitButton from './SubmitButton';

function UpdateProfileForm({ user, children }) {
  const { fullName, email, numOfKids, gender, avatar } = user;

  return (
    <form
      action={updateUser}
      className='w-[300px] xs:w-[400px] md:w-[450px] px-5 py-5 bg-primary-200 rounded-sm shadow-md'
    >
      <div className='flex flex-col gap-[2px] py-2'>
        <label htmlFor='role' className='text-primary-700'>
          User role
        </label>
        <input
          readOnly
          value='user'
          id='role'
          name='role'
          className='border-none py-1 px-3 rounded-sm shadow-md cursor-not-allowed bg-gray-500 text-gray-400'
        />
      </div>

      <div className='flex flex-col gap-[2px] py-2'>
        <label className='text-primary-700'>Full name</label>
        <input
          disabled
          defaultValue={fullName}
          name='fullName'
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
        <label htmlFor='numOfKids' className='text-primary-700'>
          How many kids do you have?
        </label>
        <select
          id='numOfKids'
          name='numOfKids'
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
          <option value='female'>male & female</option>
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
        <SubmitButton pendingLabel='Updating...'>Update profile</SubmitButton>
      </div>
    </form>
  );
}

export default UpdateProfileForm;
