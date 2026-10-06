import Link from 'next/link';

function NotFound() {
  return (
    <main className=' text-center justify-center mx-auto my-auto'>
      <h1 className='text-xl md:text-3xl font-semibold my-2 px-2'>
        找不到這個地點
      </h1>
      <Link
        href='/placelist'
        className='inline-block bg-slate-700 text-primary-50 px-6 py-3 text-sm md:text-lg'
      >
        返回景點清單
      </Link>
    </main>
  );
}

export default NotFound;
