import Image from 'next/image';
import Link from 'next/link';
import logo from '@/public/logo.png';

function Logo() {
  return (
    <Link href='/' className='mx-auto md:mx-0 md:flex md:items-center gap-4'>
      {/* <Image src='/logo.png' height='60' width='60' alt='' /> */}
      <Image
        className='xs:w-[100px] md:w-[120px]'
        src={logo}
        width='80'
        quality={100}
        alt='finding neverland logo'
      />
    </Link>
  );
}

export default Logo;
