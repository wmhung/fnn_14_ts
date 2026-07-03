import Link from 'next/link';

function NotFound() {
  return (
    <main className='text-center space-y-6 mt-4'>
      <h1 className='text-3xl font-semibold'>
        This place could not be found :(
      </h1>
      <Link
        href='/parklist'
        className='inline-block bg-slate-700 text-primary-50 px-6 py-3 text-lg'
      >
        Back to park list
      </Link>
    </main>
  );
}

export default NotFound;
