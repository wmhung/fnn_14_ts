// server rendering
import Link from 'next/link';
import Image from 'next/image';
import bg from '@/public/bg.png';
import { auth } from '@/app/_lib/auth';
import { PiParkDuotone } from 'react-icons/pi';
import { BsBookmarkStarFill } from 'react-icons/bs';
import { FaMapMarkedAlt } from 'react-icons/fa';
import DemoLoginButton from './_components/DemoLoginButton';
import { Zen_Maru_Gothic } from 'next/font/google';

// Rounded display font for the hero tagline + bottom CTA heading.
// CJK font: no latin-only subset helps, so skip preload and let unicode-range load on demand.
const zenMaru = Zen_Maru_Gothic({
  weight: ['500', '700'],
  preload: false,
  display: 'swap',
});

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
    title: '儲存地點',
    description:
      '凡走過必留下痕跡，不論任何景點，只要上傳照片和文字，就能留下美好回憶',
  },
  {
    Icon: FaMapMarkedAlt,
    iconWrap: 'bg-sky-50 ring-sky-200 dark:bg-sky-900/30 dark:ring-sky-700',
    iconColor: 'text-sky-500 dark:text-sky-400',
    title: '檢視你的地圖',
    description:
      '您可以在地圖上看到造訪過的景點座標',
  },
  {
    Icon: BsBookmarkStarFill,
    iconWrap:
      'bg-amber-50 ring-amber-200 dark:bg-amber-900/30 dark:ring-amber-700',
    iconColor: 'text-amber-500 dark:text-amber-400',
    title: '收藏最愛',
    description:
      '甚至是把全家最愛的景點加入收藏清單，一鍵即可輕鬆瀏覽全家人的回憶',
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
          priority
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

          <p className={`${zenMaru.className} text-2xl sm:text-3xl text-gray-700 dark:text-slate-300 leading-relaxed max-w-xl mx-auto`}>
            紀錄難忘的精彩時刻
          </p>

          <div className='flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-2'>
            <Link
              href={isLoggedIn ? '/placelist' : '/login'}
              className='group inline-flex items-center justify-center gap-2 bg-accent-600 hover:bg-accent-700 text-white px-6 py-3 rounded-lg font-medium shadow-sm hover:shadow-md transition'
            >
              {isLoggedIn ? '開啟我的景點' : '登入帳號'}
            </Link>

            {/* One-click demo for logged-out visitors */}
            {!isLoggedIn && <DemoLoginButton />}
          </div>
        </div>
      </section>

      {/* ─────────── FEATURES ─────────── */}
      <section
        aria-label='功能介紹'
        className='max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16'
      >

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
          <h2 className={`${zenMaru.className} text-2xl sm:text-3xl font-semibold text-white leading-tight`}>
            準備好紀錄近期的旅程嗎？
          </h2>
          <div className='mt-6 flex justify-center'>
            <Link
              href={isLoggedIn ? '/placelist' : '/register'}
              className='group inline-flex items-center gap-2 bg-white text-accent-700 hover:bg-gray-50 px-6 py-3 rounded-lg font-medium shadow-sm hover:shadow-md transition'
            >
              {isLoggedIn ? '開啟我的景點' : '建立帳號'}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
