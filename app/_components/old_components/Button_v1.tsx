import Link from 'next/link';

function Button({ children, onClick, className = '', href, ...props }) {
  const baseClass =
    'bg-accent-600 py-3 px-8 rounded-lg hover:bg-accent-100 hover:text-slate-800';
  const combined = `${baseClass} ${className}`;

  // If `href` is provided, render a Link
  if (href) {
    return (
      <Link href={href} className={combined} {...props}>
        {children}
      </Link>
    );
  }

  // Otherwise, render a regular button
  return (
    <button onClick={onClick} className={combined} {...props}>
      {children}
    </button>
  );
}

export default Button;
