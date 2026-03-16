import UpdatePasswordForm from '@/app/_components/UpdatePasswordForm';
import { auth } from '@/app/_lib/auth';

export const metadata = {
  title: 'Credentials',
};

export default async function Page() {
  const session = await auth();
  // const provider = session?.user?.provider?.toUpperCase();
  const provider = session?.user?.provider;
  const isOAuthUser = provider === 'google' || provider === 'github';

  return (
    <div className='flex flex-1 items-center justify-center min-h-screen'>
      {isOAuthUser ? (
        <>
          <p className='text-2xl text-center'>
            Opps!... Not available for {provider} authenticated user
          </p>
        </>
      ) : (
        <>
          <div className='flex flex-col items-center -translate-y-20'>
            <h1 className='text-center text-2xl mb-3'>
              Update your credentials
            </h1>
            <UpdatePasswordForm />
          </div>
        </>
      )}
    </div>
  );
}
