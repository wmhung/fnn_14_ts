import Image from 'next/image';
import image1 from '@/public/image1.png';
import Link from 'next/link';
import { FaCheckCircle } from 'react-icons/fa';

export const metadata = {
  title: '關於',
};

const features = [
  '互動式地圖',
  '上傳照片、文字',
  '瀏覽其他景點評分',
  '分享您的評論',
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
          <h1
            id='about-title'
            className='text-3xl sm:text-4xl md:text-5xl font-semibold text-gray-900 dark:text-slate-100 leading-tight'
          >
            <span className='bg-gradient-to-r from-accent-500 to-primary-500 bg-clip-text text-transparent'>
              我們的故事
            </span>
          </h1>

          <p className='text-base sm:text-lg text-gray-700 dark:text-slate-300 leading-relaxed'>
            <strong className='text-gray-900 dark:text-slate-100 font-semibold'>
              Finding Next Neverland
            </strong>{' '}
            是一款專為家長設計的網頁應用程式，用來記錄親子出遊的精彩時刻。幾張照片和文字，就能打造專屬您一家人的出遊地圖。
          </p>

          <div>
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
              開始探索
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
