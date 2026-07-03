import Image from 'next/image';
import { signInAction } from '../_lib/actions';

function SignInButton() {
  return (
    <form action={signInAction}>
      <button
        type='submit'
        className='w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-medium text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 hover:border-gray-300 dark:hover:border-slate-500 transition'
      >
        <Image
          src='https://authjs.dev/img/providers/google.svg'
          alt='Google logo'
          height='20'
          width='20'
        />
        <span>Continue with Google</span>
      </button>
    </form>
  );
}

export default SignInButton;
