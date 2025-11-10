import { signOutAction } from '../_lib/actions';

function SignOutButton() {
  return (
    <form action={signOutAction}>
      <button className='flex justify-end w-full mt-5 px-12 py-2 text-xl hover:font-black hover:text-2xl transition-all duration-300'>
        <p>Sign out</p>
      </button>
    </form>
  );
}

export default SignOutButton;
