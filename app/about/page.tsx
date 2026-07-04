import Image from 'next/image';
import image1 from '@/public/image1.png';
import Link from 'next/link';
import { FaCheckCircle, FaArrowRight } from 'react-icons/fa';

export const metadata = {
  title: 'About',
};

const features = [
  'Interactive map',
  'Upload photos',
  "See others' ratings",
  'Share your comments',
];

export default function Page() {
  return (
    <div className='w-full'>
      <section
        aria-labelledby='about-title'
        className='relative overflow-hidden min-h-[calc(100svh-5rem)] md:min-h-[80vh] flex flex-col items-center justify-center px-4 sm:px-6 py-12 sm:py-16'
      >
        {/* Background image (decorative) — same treatment as home page */}
        <Image
          src={image1}
          fill
          placeholder='blur'
          quality={80}
          alt=''
          aria-hidden='true'
          className='object-cover object-center opacity-30 dark:opacity-20 -z-20'
        />

        {/* readability scrim: above image, below the edge-fade + text */}
        <div
          aria-hidden='true'
          className='absolute inset-0 -z-[15] bg-white/60 dark:bg-slate-900/60'
        />

        {/* fades all four edges into the page background */}
        <div
          aria-hidden='true'
          className='absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,_transparent_30%,_rgb(248_250_252)_85%)] dark:bg-[radial-gradient(ellipse_at_center,_transparent_30%,_rgb(30_41_59)_85%)]'
        />

        <div className='relative max-w-3xl mx-auto text-center space-y-6'>
          <span className='inline-block text-xs font-semibold text-accent-600 dark:text-accent-400 uppercase tracking-wider'>
            About
          </span>

          <h1
            id='about-title'
            className='text-3xl sm:text-4xl md:text-5xl font-semibold text-gray-900 dark:text-slate-100 leading-tight'
          >
            Our story
          </h1>

          <p className='text-base sm:text-lg text-gray-700 dark:text-slate-300 leading-relaxed'>
            <strong className='text-gray-900 dark:text-slate-100 font-semibold'>
              Finding Next Neverland
            </strong>{' '}
            is a web application designed for parents to track and document the
            places they visit with their children. Whether it&apos;s a park,
            museum, playground, or any other fun spot, we help families record
            their experiences and build a personal map of memorable outings.
          </p>

          <div>
            <h2 className='text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-3'>
              Key features
            </h2>
            <ul className='grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto text-left'>
              {features.map((feature) => (
                <li
                  key={feature}
                  className='flex items-center gap-2 text-sm text-gray-700 dark:text-slate-200'
                >
                  <FaCheckCircle className='shrink-0 text-emerald-500 dark:text-emerald-400 w-4 h-4' />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className='pt-2'>
            <Link
              href='/placelist'
              className='group inline-flex items-center gap-2 bg-accent-600 hover:bg-accent-700 text-primary-50 px-6 py-3 rounded-lg font-medium shadow-sm hover:shadow-md transition'
            >
              Start exploring
              <FaArrowRight className='w-3.5 h-3.5 transition group-hover:translate-x-0.5' />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
