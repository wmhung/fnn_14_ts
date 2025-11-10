import Button from './Button';

function BackButton() {
  return (
    <Button
      href='/parklist'
      className='w-fit text-slate-50 bg-slate-500 hover:bg-slate-300'
    >
      Back
    </Button>
  );
}

export default BackButton;
