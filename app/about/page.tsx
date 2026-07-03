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
    <div className='w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-16'>
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center'>
        {/* CONTENT */}
        <div className='space-y-6'>
          <span className='inline-block text-xs font-semibold text-accent-600 dark:text-accent-400 uppercase tracking-wider'>
            About
          </span>

          <h1 className='text-3xl sm:text-4xl md:text-5xl font-semibold text-gray-900 dark:text-slate-100 leading-tight'>
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
            <ul className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
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

        {/* IMAGE */}
        <div className='order-first lg:order-last'>
          <div className='relative rounded-2xl overflow-hidden ring-1 ring-gray-200 dark:ring-slate-700 shadow-sm hover:shadow-md transition'>
            <Image
              src={image1}
              placeholder='blur'
              alt='Family sitting around a fire pit in front of cabin'
              quality={80}
              className='w-full h-auto'
            />
          </div>
        </div>
      </div>
    </div>
  );
}
