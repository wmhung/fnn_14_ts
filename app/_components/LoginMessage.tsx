import Link from 'next/link';

function LoginMessage() {
  return (
    <div
      className='relative flex w-full min-h-[calc(100dvh-5rem)] items-center justify-center'
      style={{
        backgroundImage:
          'linear-gradient(rgba(148,163,184,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.2) 1px, transparent 1px)',
        backgroundSize: '32px 32px',
      }}
    >
      <div className='relative z-10 flex flex-col items-center gap-5 text-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-10 shadow-sm max-w-sm mx-4'>
        {/* Icon */}
        <div className='w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='28'
            height='28'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='1.5'
            strokeLinecap='round'
            strokeLinejoin='round'
            className='text-slate-500 dark:text-slate-400'
            aria-hidden='true'
          >
            <path d='M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z' />
            <circle cx='12' cy='10' r='3' />
          </svg>
        </div>

        {/* Text */}
        <div className='flex flex-col gap-2'>
          <h2 className='text-xl text-slate-800 dark:text-slate-50'>
            Find your next neverland
          </h2>
          <p className='text-sm text-slate-500 dark:text-slate-400 leading-relaxed'>
            Sign in to discover, save, and explore places on the map.
          </p>
        </div>

        {/* CTA */}
        <Link
          href='/login'
          className='flex items-center gap-2 px-6 py-2.5 text-sm text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors duration-200'
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}

export default LoginMessage;
