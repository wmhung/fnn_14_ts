import { auth } from '@/app/_lib/auth';
import LoginMessage from '../_components/LoginMessage';
import DynamicMap from '../_components/map/Map';
import ParkLayoutFloating from '../_components/ParkLayoutFloating';

export const revalidate = 0;

export const metadata = {
  title: 'Park List',
};

export default async function Page({ searchParams }: any) {
  const session = await auth();
  if (!session?.user?.email) return <LoginMessage />;

  return (
    <div className='relative w-full h-screen'>
      {/* Map renders full screen */}
      <DynamicMap />

      {/* Floating client-only park list panels */}
      <ParkLayoutFloating
        searchParams={searchParams}
        userEmail={session.user.email}
      />
    </div>
  );
}
