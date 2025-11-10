'use client';

import { useState } from 'react';
import { BsToggleOff, BsToggleOn } from 'react-icons/bs';
import { useUserRoles } from '../_lib/contexts/UserRoleContext';

export default function UserTable({ users, currentUserEmail }) {
  const { updateUserRole } = useUserRoles();
  const [userList, setUserList] = useState(users); // local state

  const handleToggle = async (email, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';

    try {
      await updateUserRole({ email, role: newRole });
      console.log('Role update success');
      // Update the role in local state to re-render the toggle
      setUserList((prev) =>
        prev.map((user) =>
          user.email === email ? { ...user, role: newRole } : user
        )
      );
    } catch (error) {
      console.error('Role update failed:', error);
    }
  };

  return (
    <div className='overflow-x-auto mt-8 px-2'>
      <table className='min-w-[50rem] border border-slate-300 text-sm shadow-md'>
        <thead className='bg-slate-200 dark:text-slate-800'>
          <tr>
            <th className='px-2 py-2 text-center border-b'>Name</th>
            <th className='px-2 py-2 text-center border-b'>Created at</th>
            <th className='px-2 py-2 text-center border-b'>Email</th>
            <th className='px-2 py-2 text-center border-b'>User role</th>
            <th className='px-2 py-2 text-center border-b'>Role switch</th>
          </tr>
        </thead>
        <tbody>
          {userList.map((user) => (
            <tr
              key={user.id}
              className='border border-slate-300 dark:text-slate-50'
            >
              <td className='px-2 py-2 text-center'>{user.fullName}</td>
              <td className='px-2 py-2 text-center'>
                {new Date(user.created_at).toLocaleDateString()}
              </td>
              <td className='px-2 py-2 text-center'>{user.email}</td>
              <td className='px-2 py-2 text-center'>{user.role}</td>
              <td className='px-2 py-2 text-center'>
                {user.role === 'owner' || user.email === currentUserEmail ? (
                  <BsToggleOn
                    className='mx-auto w-8 h-8 opacity-50 cursor-not-allowed text-blue-600'
                    title={
                      user.role === 'owner'
                        ? 'Super admin role cannot be changed'
                        : 'You cannot change your own role'
                    }
                  />
                ) : (
                  <button
                    onClick={() => handleToggle(user.email, user.role)}
                    title={`Make ${user.role === 'admin' ? 'user' : 'admin'}`}
                  >
                    {user.role === 'admin' ? (
                      <BsToggleOn className='text-green-600 w-8 h-8' />
                    ) : (
                      <BsToggleOff className='text-gray-500 w-8 h-8' />
                    )}
                  </button>
                )}
                {/* {user.role === 'owner' ? (
                  <BsToggleOn
                    className='mx-auto text-blue-600 w-8 h-8 opacity-50 cursor-not-allowed'
                    title='Super admin role cannot be changed'
                  />
                ) : (
                  <button
                    onClick={() => handleToggle(user.email, user.role)}
                    title={`Make ${user.role === 'admin' ? 'user' : 'admin'}`}
                  >
                    {user.role === 'admin' ? (
                      <BsToggleOn className='text-green-600 w-8 h-8' />
                    ) : (
                      <BsToggleOff className='text-gray-500 w-8 h-8' />
                    )}
                  </button>
                )} */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
