'use client';

import { useState } from 'react';
import { BsToggleOff, BsToggleOn } from 'react-icons/bs';
import { useUserRoles } from '../_lib/contexts/UserRoleContext';

// Define the shape of each user object
interface User {
  id: string;
  full_name: string;
  created_at: string;
  email: string;
  role: 'owner' | 'admin' | 'user';
}

// Define component props
interface UserTableProps {
  users: User[];
  currentUserEmail: string;
}

export default function UserTable({ users, currentUserEmail }: UserTableProps) {
  const { updateUserRole } = useUserRoles();
  const [userList, setUserList] = useState<User[]>(users);

  const handleToggle = async (email: string, currentRole: User['role']) => {
    const newRole: User['role'] = currentRole === 'admin' ? 'user' : 'admin';

    try {
      await updateUserRole({ email, role: newRole });

      setUserList((prev) =>
        prev.map((user) =>
          user.email === email ? { ...user, role: newRole } : user,
        ),
      );
    } catch (error) {
      console.error('Role update failed:', error);
    }
  };

  return (
    <div className='mt-8 px-2'>
      {/* ================= MOBILE: CARD VIEW ================= */}
      <div className='md:hidden space-y-4'>
        {userList.map((user) => (
          <div
            key={user.id}
            className='border border-slate-300 rounded-xl p-4 shadow-sm bg-white dark:bg-slate-800 dark:text-slate-50'
          >
            <p>
              <span className='font-semibold'>Name:</span> {user.full_name}
            </p>
            <p>
              <span className='font-semibold'>Email:</span> {user.email}
            </p>
            <p>
              <span className='font-semibold'>Role:</span> {user.role}
            </p>
            <p>
              <span className='font-semibold'>Created:</span>{' '}
              {new Date(user.created_at).toLocaleDateString()}
            </p>

            <div className='mt-3'>
              {user.role === 'owner' || user.email === currentUserEmail ? (
                <span className='text-gray-400 text-sm'>
                  {user.role === 'owner'
                    ? 'Super admin role cannot be changed'
                    : 'You cannot change your own role'}
                </span>
              ) : (
                <button
                  onClick={() => handleToggle(user.email, user.role)}
                  className='text-blue-600 text-sm'
                >
                  Make {user.role === 'admin' ? 'user' : 'admin'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ================= DESKTOP: TABLE VIEW ================= */}
      <div className='hidden md:block overflow-x-auto overflow-y-auto max-h-[400px]'>
        <table className='min-w-[50rem] border border-slate-300 text-sm shadow-md'>
          <thead className='bg-slate-200 dark:bg-slate-200 dark:text-slate-800 sticky top-0 z-10'>
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
                <td className='px-2 py-2 text-center'>{user.full_name}</td>
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
