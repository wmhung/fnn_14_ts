import Link from 'next/link';

function LoginMessage() {
  return (
    <div className='flex m-auto'>
      <div
        className='relative flex justify-center items-center
  text-2xl w-sm h-[35rem] ml-10'
      >
        <p className='break-words'>
          Please
          <Link href='/login' className='underline text-accent-500 mx-2 top-50'>
            login
          </Link>
          to find your neverland!
        </p>
      </div>
    </div>
  );
}

export default LoginMessage;
