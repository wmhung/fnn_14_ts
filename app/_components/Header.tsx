import Logo from './Logo';
import Navigation from './Navigation';
import BurgerMenu from './BurgerMenu';

function Header() {
  return (
    <div className='w-full my-5 px-8 z-10'>
      <div className='flex justify-between items-center max-w-7xl mx-auto'>
        <Logo />
        <Navigation />
        <BurgerMenu />
      </div>
    </div>
  );
}

export default Header;
