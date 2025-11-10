'use client';

function Message({ message }) {
  return (
    <p className='text-center text-[1.8rem] w-4/5 my-8 mx-auto font-semibold'>
       {message}
    </p>
  );
}

export default Message;
