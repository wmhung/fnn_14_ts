'use client';

import PlaceLayout from './PlaceLayout';
import PlaceLayoutMobile from './PlaceLayoutMobile';
import { PlaceDataProvider } from '../_lib/contexts/PlaceDataContext';
import { MobilePanelProvider } from '../_lib/contexts/MobilePanelContext';

export default function PlaceLayoutFloating({ initialData }: any) {
  if (!initialData) return null;

  return (
    <MobilePanelProvider>
      <PlaceDataProvider value={initialData}>
        {/* Desktop floating panel */}
        <div className='absolute top-20 left-4 max-w-[24rem] max-h-[82%] p-3 hidden md:flex md:flex-col z-10 rounded-lg shadow-xl bg-slate-50 dark:bg-slate-800 overflow-hidden'>
          <PlaceLayout data={initialData} />
        </div>

        {/* Mobile floating panel */}
        <div className='absolute bottom-0 left-0 right-0 h-[60%] md:hidden z-10 rounded-t-lg shadow-xl bg-slate-50 dark:bg-slate-800 overflow-hidden'>
          <PlaceLayoutMobile data={initialData} />
        </div>
      </PlaceDataProvider>
    </MobilePanelProvider>
  );
}
