import UpdatePasswordForm from '@/app/_components/UpdatePasswordForm';
import { auth } from '@/app/_lib/auth';

export const metadata = {
  title: 'Credentials',
};

export default async function Page() {
  const session = await auth();
  const provider = session?.user?.provider?.toUpperCase();

  return (
    <div className='mx-auto my-auto'>
      {provider ? (
        <>
          <p className='flex mb-3 justify-center text-2xl'>
            Opps!... Not available for {provider} authenticated user
          </p>
        </>
      ) : (
        <>
          <h1 className='flex mb-3 justify-center text-2xl'>
            Update your credentials
          </h1>
          <UpdatePasswordForm />
        </>
      )}
    </div>
  );
}
