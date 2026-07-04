// server rendering
import Link from 'next/link';
import Image from 'next/image';
import bg from '@/public/bg.png';
import { auth } from '@/app/_lib/auth';
import { PiParkDuotone } from 'react-icons/pi';
import { BsBookmarkStarFill } from 'react-icons/bs';
import { FaMapMarkedAlt, FaArrowRight } from 'react-icons/fa';

type Feature = {
  Icon: React.ComponentType<{ className?: string }>;
  iconWrap: string;
  iconColor: string;
  title: string;
  description: string;
};

const features: Feature[] = [
  {
    Icon: PiParkDuotone,
    iconWrap:
      'bg-emerald-50 ring-emerald-200 dark:bg-emerald-900/30 dark:ring-emerald-700',
    iconColor: 'text-emerald-500 dark:text-emerald-400',
    title: 'Save places',
    description:
      'Track parks, playgrounds, museums, and schools you visit with your kids. Add photos and notes to each.',
  },
  {
    Icon: FaMapMarkedAlt,
    iconWrap: 'bg-sky-50 ring-sky-200 dark:bg-sky-900/30 dark:ring-sky-700',
    iconColor: 'text-sky-500 dark:text-sky-400',
    title: 'See your map',
    description:
      'Every place you save appears as a pin on your private map — a personal atlas of family memories.',
  },
  {
    Icon: BsBookmarkStarFill,
    iconWrap:
      'bg-amber-50 ring-amber-200 dark:bg-amber-900/30 dark:ring-amber-700',
    iconColor: 'text-amber-500 dark:text-amber-400',
    title: 'Bookmark favourites',
    description:
      'Heart the spots your family loves most. They live in their own tab — always one tap away.',
  },
];

export default async function Page() {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  return (
    <div className='w-full'>
      {/* ─────────── HERO ─────────── */}
      <section
        aria-labelledby='hero-title'
        className='relative overflow-hidden min-h-[calc(100svh-5rem)] md:min-h-[80vh]
 flex flex-col items-center justify-center px-4 sm:px-6 py-12 sm:py-16'
      >
        {/* Background image (decorative) */}
        <Image
          src={bg}
          fill
          placeholder='blur'
          quality={80}
          alt=''
          aria-hidden='true'
          className='object-cover object-top opacity-30 dark:opacity-20 -z-20'
        />

        {/* readability scrim: above image, below the edge-fade + text */}
        <div
          aria-hidden='true'
          className='absolute inset-0 -z-[15] bg-white/30 dark:bg-slate-900/60'
        />

        {/* fades all four edges into the page background */}
        <div
          aria-hidden='true'
          className='absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,_transparent_30%,_rgb(248_250_252)_85%)] dark:bg-[radial-gradient(ellipse_at_center,_transparent_30%,_rgb(30_41_59)_85%)]'
        />
        <div className='relative max-w-3xl mx-auto text-center space-y-6'>
          <h1
            id='hero-title'
            className='text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-none'
          >
            <span className='bg-gradient-to-r from-accent-500 to-primary-500 bg-clip-text text-transparent'>
              Finding Next Neverland
            </span>
          </h1>

          <p className='text-base sm:text-lg text-gray-700 dark:text-slate-300 leading-relaxed max-w-xl mx-auto'>
            Turn every family outing into a memory worth keeping on the map.
          </p>

          <div className='flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-2'>
            <Link
              href={isLoggedIn ? '/placelist' : '/login'}
              className='group inline-flex items-center justify-center gap-2 bg-accent-600 hover:bg-accent-700 text-white px-6 py-3 rounded-lg font-medium shadow-sm hover:shadow-md transition'
            >
              {isLoggedIn ? 'Open my places' : 'Get started'}
              <FaArrowRight className='w-3.5 h-3.5 transition group-hover:translate-x-0.5' />
            </Link>

            <Link
              href='/about'
              className='inline-flex items-center justify-center gap-2 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 ring-1 ring-gray-200 dark:ring-slate-600 px-6 py-3 rounded-lg font-medium shadow-sm transition'
            >
              Learn more
            </Link>
          </div>
        </div>
      </section>

      {/* ─────────── FEATURES ─────────── */}
      <section
        aria-labelledby='features-title'
        className='max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16'
      >
        <div className='text-center max-w-2xl mx-auto mb-10'>
          <span className='inline-block text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider'>
            What you can do
          </span>
          <h2
            id='features-title'
            className='mt-1 text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-slate-100 leading-tight'
          >
            Everything you need to remember the trip
          </h2>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6'>
          {features.map(({ Icon, iconWrap, iconColor, title, description }) => (
            <div
              key={title}
              className='bg-white dark:bg-slate-900 rounded-2xl ring-1 ring-gray-200 dark:ring-slate-700 shadow-sm p-6 hover:-translate-y-0.5 hover:shadow-md hover:ring-gray-300 dark:hover:ring-slate-600 transition'
            >
              <div
                className={`flex items-center justify-center w-11 h-11 rounded-full ring-1 ring-inset ${iconWrap} mb-4`}
              >
                <Icon className={`w-5 h-5 ${iconColor}`} />
              </div>
              <h3 className='font-semibold text-base text-gray-900 dark:text-slate-100 mb-1.5'>
                {title}
              </h3>
              <p className='text-sm text-gray-600 dark:text-slate-300 leading-relaxed'>
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─────────── BOTTOM CTA ─────────── */}
      <section className='max-w-4xl mx-auto px-4 sm:px-6 pb-12 sm:pb-16'>
        <div className='rounded-2xl bg-gradient-to-br from-accent-500 to-primary-600 px-6 sm:px-10 py-10 sm:py-12 text-center shadow-sm'>
          <h2 className='text-2xl sm:text-3xl font-semibold text-white leading-tight'>
            {isLoggedIn
              ? 'Ready to add your next adventure?'
              : 'Ready to map your family adventures?'}
          </h2>
          <p className='mt-3 text-sm sm:text-base text-white/90 max-w-xl mx-auto leading-relaxed'>
            {isLoggedIn
              ? 'Jump back in and add the places you visited this week.'
              : 'Free to start. No credit card. Sign up in under a minute and add your first place today.'}
          </p>
          <div className='mt-6 flex justify-center'>
            <Link
              href={isLoggedIn ? '/placelist' : '/register'}
              className='group inline-flex items-center gap-2 bg-white text-accent-700 hover:bg-gray-50 px-6 py-3 rounded-lg font-medium shadow-sm hover:shadow-md transition'
            >
              {isLoggedIn ? 'Open my places' : 'Create your account'}
              <FaArrowRight className='w-3.5 h-3.5 transition group-hover:translate-x-0.5' />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
