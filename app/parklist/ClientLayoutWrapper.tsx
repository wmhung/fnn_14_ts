'use client';

import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import MapLoginMessage from '../_components/MapLoginMessage';

const DynamicMap = dynamic(() => import('../_components/map/Map'), {
  ssr: false,
});

export default function ClientLayoutWrapper({ children, email }) {
  const pathname = usePathname();

  // Detect if current route is the form page
  const isFormPage = pathname === '/parklist/form';

  // Detect if current route is a park detail page (e.g. /parklist/abc123)
  const isParkDetailPage =
    pathname.startsWith('/parklist/') &&
    pathname !== '/parklist' &&
    !isFormPage;

  return (
    <div className='flex flex-col md:flex-row w-full h-full overflow-hidden'>
      {/* Desktop layout */}
      <section className='relative hidden md:flex flex-col max-w-[28rem] lg:mx-auto'>
        {children}
      </section>

      {/* Desktop map */}
      <div className='flex flex-1 w-full'>
        {email ? <DynamicMap /> : <MapLoginMessage />}
      </div>

      {/* Mobile layout */}
      <div className='md:hidden relative w-full'>
        {/* Render children normally for the park list page only */}
        {!isFormPage && !isParkDetailPage && children}

        {/* Modal overlay for /parklist/form */}
        {isFormPage && (
          <div className='fixed w-full h-full bg-[rgba(0,0,0,0.7)] z-50 left-0 top-0'>
            <div className='absolute w-full bg-slate-50 p-4 z-60 bottom-0 left-0 right-0 max-h-[90vh] overflow-y-auto shadow-2xl rounded-t-2xl'>
              {children}
            </div>
          </div>
        )}

        {/* Modal overlay for park item detail pages */}
        {isParkDetailPage && (
          <div className='fixed w-full h-full bg-[rgba(0,0,0,0.7)] z-50 left-0 top-0'>
            <div className='absolute w-full bg-slate-50 p-4 z-60 bottom-0 left-0 right-0 max-h-[90vh] overflow-y-auto shadow-2xl rounded-t-2xl dark:bg-slate-800'>
              {children}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
