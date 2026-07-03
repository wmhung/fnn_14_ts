import UpdatePasswordForm from '@/app/_components/UpdatePasswordForm';
import { auth } from '@/app/_lib/auth';
import { FaInfoCircle } from 'react-icons/fa';
import Link from 'next/link';
import LoginMessage from '@/app/_components/LoginMessage';

export const metadata = {
  title: 'Credentials',
};

export default async function Page() {
  const session = await auth();

  if (!session?.user) return <LoginMessage />;

  const provider = session?.user?.provider;
  const isOAuthUser = provider === 'google' || provider === 'github';
  const providerLabel =
    provider === 'google'
      ? 'Google'
      : provider === 'github'
        ? 'GitHub'
        : provider;

  return (
    <div className='w-full max-w-md mx-auto px-4 sm:px-6 py-8 sm:py-12'>
      <div className='text-center mb-8'>
        <span className='inline-block text-xs font-semibold text-accent-600 dark:text-accent-400 uppercase tracking-wider'>
          Security
        </span>
        <h1 className='mt-1 text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-slate-100 leading-tight'>
          Update your credentials
        </h1>
      </div>

      {isOAuthUser ? (
        <div className='w-full max-w-md mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-sm ring-1 ring-gray-200 dark:ring-slate-700 p-6 sm:p-8 space-y-4'>
          <div className='flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:bg-amber-900/30 dark:border-amber-700 dark:text-amber-200'>
            <FaInfoCircle className='shrink-0 mt-0.5' />
            <div>
              <p className='font-medium'>Password not editable</p>
              <p className='mt-1'>
                Your account is signed in with {providerLabel}. Manage your
                password through your {providerLabel} account.
              </p>
            </div>
          </div>
          <Link
            href='/dashboard'
            className='block w-full text-center px-6 py-2.5 rounded-lg font-medium bg-primary-700 text-white hover:bg-primary-800 shadow-sm hover:shadow-md transition'
          >
            Back to dashboard
          </Link>
        </div>
      ) : (
        <UpdatePasswordForm />
      )}
    </div>
  );
}
