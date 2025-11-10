import { auth } from '../_lib/auth';
import ClientLayoutWrapper from './ClientLayoutWrapper'; 

export default async function parkListLayout({ children }) {
  const session = await auth();
  const email = session?.user.email;

  return <ClientLayoutWrapper email={email}>{children}</ClientLayoutWrapper>;
}
