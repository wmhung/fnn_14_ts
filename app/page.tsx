//  server rendering
import Link from 'next/link';
import Image from 'next/image';
import bg from '@/public/bg.png';
import { auth } from '@/app/_lib/auth';

export default async function Page() {
  const session = await auth();
  // console.log(session);

  return (
    <main className='mt-2'>
      {/* <main className='relative w-full h-screen overflow-hidden'> */}
      <Image
        src={bg}
        fill
        placeholder='blur'
        quality={80}
        className='object-cover object-top z-0 opacity-20'
        alt='homepage background'
      />

      {/* <div className='relative items-center text-center px-4'> */}
      <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 items-center text-center'>
        <h1 className='mb-10 text-5xl xs:text-6xl bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent font-extrabold tracking-wide'>
          親子探索地圖
        </h1>

        <Link
          href={session?.user ? '/parklist' : '/login'}
          className='bg-accent-600 px-8 py-4 text-primary-50 text-xl font-extrabold rounded-xl hover:bg-primary-50 hover:text-accent-600 transition-all duration-300'
        >
          {session?.user ? 'GO' : 'Login'}
        </Link>
      </div>
    </main>
  );
}
