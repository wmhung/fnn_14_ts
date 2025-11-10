import Spinner from '@/app/_components/Spinner';

export default function Loading() {
  return (
    <div className='fixed inset-0 z-[80] flex flex-col justify-center items-center bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm'>
      <Spinner />
      <span className='mt-4 text-xl text-slate-800  dark:text-slate-50'>
        Loading park data...
      </span>
    </div>
  );
}
