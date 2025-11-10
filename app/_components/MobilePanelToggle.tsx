'use client';
import { GiParkBench } from 'react-icons/gi';
import { BsBookmarkCheck } from 'react-icons/bs';
import { RxCross2 } from 'react-icons/rx';
import { useMobilePanel } from '../_lib/contexts/MobilePanelContext';

function MobilePanelToggle() {
  const { view, setView } = useMobilePanel();

  return (
    <div className='flex justify-around w-full px-auto md:hidden dark:bg-slate-800'>
      <button
        className='w-20 mx-auto text-slate-700 dark:text-slate-50  font-bold'
        onClick={() => setView('list')}
      >
        <GiParkBench className='mx-auto my-2 w-7 h-7' />
        <p className='mx-auto my-1 text-xs font-extrabold'>Park List</p>
      </button>
      <button
        className='w-20 mx-auto text-slate-700 dark:text-slate-50 font-bold'
        onClick={() => setView(null)}
      >
        <RxCross2 className='mx-auto my-2 w-7 h-7' />
        <p className='mx-auto my-1 text-xs font-extrabold'>Close</p>
      </button>
      <button
        className='w-20 mx-auto text-slate-700 dark:text-slate-50 font-bold'
        onClick={() => setView('bookmarks')}
      >
        <BsBookmarkCheck className='mx-auto my-2 w-7 h-7' />
        <p className='mx-auto my-1 text-xs font-extrabold'>Bookmarks</p>
      </button>
    </div>
  );
}

export default MobilePanelToggle;
