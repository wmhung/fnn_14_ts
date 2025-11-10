import Image from 'next/image';
import image1 from '@/public/image1.png';
import Link from 'next/link';

export const metadata = {
  title: 'About',
};
export default function Page() {
  // page title

  return (
    <div className='flex 2xs:flex-2 xs:flex-1 justify-center items-center mx-5 px-2 text-xl'>
      <div className='flex flex-col max-w-[40rem]'>
        <div className='my-5 mx-3 px-3'>
          <h1 className='text-left 2xs:text-center md:text-justify text-2xl md:text-3xl mb-5 text-accent-500 font-extrabold'>
            Our story
          </h1>

          <p className='text-justify md:text-left  text-slate-500 my-2 text-base/9'>
            <strong className='text-slate-700'>Finding Next Neverland</strong>{' '}
            is a web application designed for parents to track and document the
            places they visit with their children. Whether it’s a park, museum,
            playground, or any fun spot, ParentTrack helps families record their
            experiences and build a personal map of memorable outings.
          </p>

          <p className='text-center md:text-left  text-slate-500 my-2 text-base/9'>
            <strong className='text-slate-700'>Key Features</strong>
            <br /> ✅ Interactive Map
            <br />✅ Upload Photos
            <br /> ✅ See other&#39; rating
            <br />✅ Share your comments
          </p>

          <div className='text-center md:text-left  my-7'>
            <Link
              href='/parklist'
              className='bg-accent-600 px-8 py-4 text-primary-50 text-lg font-semibold rounded-xl hover:bg-accent-200 hover:text-primary-950 transition-all'
            >
              Start to track
            </Link>
          </div>
          <div className='block max-w-[40rem] lg:hidden py-3'>
            <Image
              className='rounded-md shadow-lg'
              src={image1}
              placeholder='blur'
              alt='Family sitting around a fire pit in front of cabin'
              quality={80}
            />
          </div>
        </div>
      </div>
      <div className='hidden flex-col max-w-[25rem] lg:flex'>
        <Image
          className='rounded-md shadow-lg'
          src={image1}
          placeholder='blur'
          alt='Family sitting around a fire pit in front of cabin'
          quality={80}
        />
      </div>
    </div>
  );
}
