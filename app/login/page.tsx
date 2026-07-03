import LoginForm from '../_components/LoginForm';

export const metadata = {
  title: 'Login',
};

export default async function Page() {
  return (
    <div className='w-full max-w-md mx-auto px-4 sm:px-6 py-8 sm:py-12'>
      <div className='text-center mb-8'>
        <span className='inline-block text-xs font-semibold text-accent-600 dark:text-accent-400 uppercase tracking-wider'>
          Welcome back
        </span>
        <h1 className='mt-1 text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-slate-100 leading-tight'>
          Sign in to your account
        </h1>
      </div>
      <LoginForm />
    </div>
  );
}
