import { signOutAction } from '../_lib/actions';

function SignOutButton() {
  return (
    <form action={signOutAction}>
      <button className='flex justify-end w-full mt-5 px-10 py-2 text-sm'>
        <p>Sign out</p>
      </button>
    </form>
  );
}

export default SignOutButton;
