import { auth } from '../_lib/auth';
import ClientLayoutWrapper from './ClientLayoutWrapper';

export default async function parkListLayout({ children }) {
  const session = await auth();
  const email = session?.user?.email;

  return (
    <>
      {/* Warm up the OSM tile connection before Leaflet asks for tiles (LCP) */}
      <link rel='preconnect' href='https://tile.openstreetmap.org' />
      <ClientLayoutWrapper email={email}>{children}</ClientLayoutWrapper>
    </>
  );
}
