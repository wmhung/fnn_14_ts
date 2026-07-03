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

const sectionHeaderClass =
  'text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider';

const thClass =
  'px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider';

function RoleBadge({ role }: { role: User['role'] }) {
  const styles: Record<User['role'], string> = {
    owner:
      'bg-purple-50 text-purple-700 ring-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:ring-purple-700',
    admin:
      'bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:ring-blue-700',
    user: 'bg-gray-50 text-gray-700 ring-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:ring-slate-600',
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${styles[role]}`}
    >
      {role}
    </span>
  );
}

function YouChip() {
  return (
    <span className='text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300'>
      You
    </span>
  );
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
    <div className='mt-8 w-full max-w-[60rem] mx-auto px-2'>
      <div className='bg-white dark:bg-slate-900 rounded-2xl shadow-sm ring-1 ring-gray-200 dark:ring-slate-700 overflow-hidden'>
        {/* HEADER */}
        <div className='flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-slate-700'>
          <div>
            <h2 className={sectionHeaderClass}>Members</h2>
            <p className='text-sm text-gray-500 dark:text-slate-400 mt-1'>
              {userList.length} {userList.length === 1 ? 'member' : 'members'}{' '}
              total
            </p>
          </div>
        </div>

        {/* EMPTY STATE */}
        {userList.length === 0 && (
          <div className='py-12 text-center text-sm text-gray-500 dark:text-slate-400'>
            No members found.
          </div>
        )}

        {userList.length > 0 && (
          <>
            {/* Mobile */}
            <ul className='md:hidden divide-y divide-gray-100 dark:divide-slate-700'>
              {userList.map((user) => {
                const isLocked =
                  user.role === 'owner' || user.email === currentUserEmail;
                const lockReason =
                  user.role === 'owner'
                    ? 'Owner role is locked'
                    : 'You cannot change your own role';

                return (
                  <li key={user.id} className='p-4 sm:p-5 space-y-3'>
                    <div className='flex items-start justify-between gap-3'>
                      <div className='min-w-0 flex-1'>
                        <div className='flex items-center gap-2 flex-wrap'>
                          <p className='text-sm font-medium text-gray-900 dark:text-slate-100 truncate'>
                            {user.full_name}
                          </p>
                          {user.email === currentUserEmail && <YouChip />}
                        </div>
                        <p className='text-xs text-gray-500 dark:text-slate-400 break-all'>
                          {user.email}
                        </p>
                        <p className='text-xs text-gray-400 dark:text-slate-500 mt-1'>
                          Joined{' '}
                          {new Date(user.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <RoleBadge role={user.role} />
                    </div>

                    <div className='flex items-center justify-end'>
                      {isLocked ? (
                        <span className='text-xs text-gray-400 dark:text-slate-500'>
                          {lockReason}
                        </span>
                      ) : (
                        <button
                          onClick={() => handleToggle(user.email, user.role)}
                          className='inline-flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-slate-200 hover:text-gray-900 dark:hover:text-white transition'
                        >
                          {user.role === 'admin' ? (
                            <BsToggleOn className='w-6 h-6 text-emerald-500' />
                          ) : (
                            <BsToggleOff className='w-6 h-6 text-gray-400' />
                          )}
                          Make {user.role === 'admin' ? 'user' : 'admin'}
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>

            {/* Desktop */}
            <div className='hidden md:block max-h-[420px] overflow-y-auto'>
              <table className='min-w-full text-sm'>
                <thead className='bg-gray-50 dark:bg-slate-800 sticky top-0 z-10'>
                  <tr>
                    <th className={thClass}>Name</th>
                    <th className={thClass}>Email</th>
                    <th className={thClass}>Role</th>
                    <th className={thClass}>Joined</th>
                    <th className={`${thClass} text-right`}>Toggle</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-100 dark:divide-slate-700'>
                  {userList.map((user) => {
                    const isLocked =
                      user.role === 'owner' || user.email === currentUserEmail;
                    const lockReason =
                      user.role === 'owner'
                        ? 'Owner role is locked'
                        : 'You cannot change your own role';

                    return (
                      <tr
                        key={user.id}
                        className='hover:bg-gray-50 dark:hover:bg-slate-800/50 transition'
                      >
                        <td className='px-4 py-3 whitespace-nowrap'>
                          <div className='flex items-center gap-2'>
                            <span className='font-medium text-gray-900 dark:text-slate-100'>
                              {user.full_name}
                            </span>
                            {user.email === currentUserEmail && <YouChip />}
                          </div>
                        </td>
                        <td className='px-4 py-3 text-gray-600 dark:text-slate-300'>
                          {user.email}
                        </td>
                        <td className='px-4 py-3'>
                          <RoleBadge role={user.role} />
                        </td>
                        <td className='px-4 py-3 text-gray-500 dark:text-slate-400 whitespace-nowrap'>
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className='px-4 py-3 text-right'>
                          {isLocked ? (
                            <span
                              title={lockReason}
                              className='inline-flex items-center text-gray-300 dark:text-slate-600 cursor-not-allowed'
                            >
                              <BsToggleOn className='w-7 h-7' />
                            </span>
                          ) : (
                            <button
                              onClick={() =>
                                handleToggle(user.email, user.role)
                              }
                              title={`Make ${
                                user.role === 'admin' ? 'user' : 'admin'
                              }`}
                              className='inline-flex items-center hover:opacity-80 transition'
                            >
                              {user.role === 'admin' ? (
                                <BsToggleOn className='w-7 h-7 text-emerald-500' />
                              ) : (
                                <BsToggleOff className='w-7 h-7 text-gray-400' />
                              )}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
