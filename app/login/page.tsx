import LoginForm from '../_components/LoginForm';

export const metadata = {
  title: 'Login',
};

export default async function Page() {
  return (
    <div className='flex'>
      <div className='mx-auto my-auto'>
        <h1 className='flex mb-3 justify-center text-2xl'>
          Sign in to your account
        </h1>
        <LoginForm />
      </div>
    </div>
  );
}
