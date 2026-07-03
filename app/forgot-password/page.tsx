import ForgotPasswordForm from '../_components/ForgotPasswordForm';

export const metadata = { title: 'Forgot password' };

export default function Page() {
  return (
    <div className='w-full max-w-md mx-auto px-4 sm:px-6 py-8 sm:py-12'>
      <div className='text-center mb-8'>
        <span className='inline-block text-xs font-semibold text-accent-600 dark:text-accent-400 uppercase tracking-wider'>
          Account recovery
        </span>
        <h1 className='mt-1 text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-slate-100 leading-tight'>
          Reset your password
        </h1>
      </div>
      <ForgotPasswordForm />
    </div>
  );
}
