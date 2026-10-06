import Link from 'next/link';

function NotFound() {
  return (
    <main className='text-center space-y-6 mt-4'>
      <h1 className='text-3xl font-semibold'>
        找不到這個地點 :(
      </h1>
      <Link
        href='/parklist'
        className='inline-block bg-slate-700 text-primary-50 px-6 py-3 text-lg'
      >
        返回公園列表
      </Link>
    </main>
  );
}

export default NotFound;
