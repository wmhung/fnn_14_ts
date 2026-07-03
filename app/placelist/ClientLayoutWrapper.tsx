'use client';

import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';

const DynamicMap = dynamic(() => import('../_components/map/Map'), {
  ssr: false,
});

export default function ClientLayoutWrapper({ children, email }) {
  const pathname = usePathname();

  // Unauthenticated: render children full-width (LoginMessage handles its own layout)
  if (!email) {
    return <div className='w-full h-full'>{children}</div>;
  }

  // Detect if current route is the form page
  const isFormPage = pathname === '/placelist/form';

  // Detect if current route is a place detail page (e.g. /placelist/abc123)
  const isPlaceDetailPage =
    pathname.startsWith('/placelist/') &&
    pathname !== '/placelist' &&
    !isFormPage;

  return (
    <div className='flex flex-col md:flex-row w-full h-full overflow-hidden'>
      {/* Desktop layout */}
      <section className='relative hidden md:flex flex-col max-w-[28rem] lg:mx-auto'>
        {children}
      </section>

      {/* Desktop map */}
      <div className='flex flex-1 w-full'>
        <DynamicMap />
      </div>

      {/* Mobile layout */}
      <div className='md:hidden relative w-full'>
        {/* Render children normally for the place list page only */}
        {!isFormPage && !isPlaceDetailPage && children}

        {/* Modal overlay for /placelist/form */}
        {isFormPage && (
          <div className='fixed w-full h-full bg-[rgba(0,0,0,0.7)] z-50 left-0 top-0'>
            <div className='absolute w-full bg-slate-50 p-4 z-60 bottom-0 left-0 right-0 max-h-[90vh] overflow-y-auto shadow-2xl rounded-t-2xl dark:bg-slate-800'>
              {children}
            </div>
          </div>
        )}

        {/* Modal overlay for place item detail pages */}
        {isPlaceDetailPage && (
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
