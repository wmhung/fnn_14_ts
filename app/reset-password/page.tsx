import ResetPasswordForm from '../_components/ResetPasswordForm';
import { FaExclamationCircle } from 'react-icons/fa';
import { isResetTokenValid } from '../_lib/actions';

export const metadata = { title: 'Reset password' };

export default async function Page({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  const token = searchParams.token ?? '';

  // Validate on load (missing / expired / already-used) so a dead link
  const valid = token ? await isResetTokenValid(token) : false;

  if (!valid) {
    return (
      <div className='w-full max-w-md mx-auto px-4 sm:px-6 py-8 sm:py-12'>
        <div className='w-full max-w-md mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-sm ring-1 ring-gray-200 dark:ring-slate-700 p-6 sm:p-8'>
          <div className='flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:bg-red-900/30 dark:border-red-700 dark:text-red-200'>
            <FaExclamationCircle className='shrink-0 mt-0.5' />
            <span>This link is invalid or has expired.</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='w-full max-w-md mx-auto px-4 sm:px-6 py-8 sm:py-12'>
      <div className='text-center mb-8'>
        <span className='inline-block text-xs font-semibold text-accent-600 dark:text-accent-400 uppercase tracking-wider'>
          Security
        </span>
        <h1 className='mt-1 text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-slate-100 leading-tight'>
          Choose a new password
        </h1>
      </div>
      <ResetPasswordForm token={token} />
    </div>
  );
}
