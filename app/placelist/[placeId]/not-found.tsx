import Link from 'next/link';

function NotFound() {
  return (
    <main className=' text-center justify-center mx-auto my-auto'>
      <h1 className='text-xl md:text-3xl font-semibold my-2 px-2'>
        This place could not be found
      </h1>
      <Link
        href='/placelist'
        className='inline-block bg-slate-700 text-primary-50 px-6 py-3 text-sm md:text-lg'
      >
        Back to place list
      </Link>
    </main>
  );
}

export default NotFound;
