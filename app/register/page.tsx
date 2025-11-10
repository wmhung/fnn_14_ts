import SignupForm from '../_components/SignupForm';

export const metadata = {
  title: 'Register',
};

export default async function Page() {
  return (
    <div className='flex'>
      <div className='mx-auto my-auto'>
        <h1 className='flex mb-3 justify-center text-2xl'>Create a new user</h1>
        <SignupForm />
      </div>
    </div>
  );
}
