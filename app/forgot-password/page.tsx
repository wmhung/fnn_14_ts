import ForgotPasswordForm from '../_components/ForgotPasswordForm';

export const metadata = { title: '忘記密碼' };

export default function Page() {
  return (
    <div className='w-full max-w-md mx-auto px-4 sm:px-6 py-8 sm:py-12'>
      <div className='text-center mb-8'>
        <h1 className='mt-1 text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-slate-100 leading-tight'>
          <span className='bg-gradient-to-r from-accent-500 to-primary-500 bg-clip-text text-transparent'>
            重設密碼
          </span>
        </h1>
      </div>
      <ForgotPasswordForm />
    </div>
  );
}
