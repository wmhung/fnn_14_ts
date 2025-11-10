// import Link from 'next/link';

function MapLoginMessage() {
  return (
    <div className='noise-texture flex m-auto'>
      <div className='flex justify-center items-center text-2xl w-100rem h-[35rem] '>
        <p className='break-words'>
          Sorry, map is not found...
          {/* <Link href='/login' className='underline text-accent-500 mx-2 top-50'>
            login
          </Link> */}
        </p>
      </div>
    </div>
  );
}

export default MapLoginMessage;
