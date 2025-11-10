'use client';

import ParkLayout from './ParkLayout';
import ParkLayoutMobile from './ParkLayoutMobile';
import { ParkDataProvider } from '../_lib/contexts/ParkDataContext';
import { MobilePanelProvider } from '../_lib/contexts/MobilePanelContext';

export default function ParkLayoutFloating({ initialData }: any) {
  if (!initialData) return null;

  return (
    <MobilePanelProvider>
      <ParkDataProvider value={initialData}>
        {/* Desktop floating panel */}
        <div className='absolute top-20 left-4 max-w-[24rem] max-h-[82%] p-3 hidden md:block z-10 rounded-lg shadow-xl bg-slate-50 dark:bg-slate-800 overflow-hidden'>
          <ParkLayout data={initialData} />
        </div>

        {/* Mobile floating panel */}
        <div className='absolute bottom-0 left-0 right-0 h-[60%] md:hidden z-10 rounded-t-lg shadow-xl bg-slate-50 dark:bg-slate-800 overflow-hidden'>
          <ParkLayoutMobile data={initialData} />
        </div>
      </ParkDataProvider>
    </MobilePanelProvider>
  );
}
