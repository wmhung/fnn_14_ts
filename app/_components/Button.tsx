import Link from 'next/link';
import React from 'react';

type ButtonProps = {
  children: React.ReactNode;
  className?: string;
  href?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  [x: string]: any; // allow other props
};

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  className = '',
  href,
  ...props
}) => {
  const baseClass =
    'bg-accent-600 py-3 px-8 rounded-lg hover:bg-accent-100 hover:text-slate-800';
  const combined = `${baseClass} ${className}`;

  if (href) {
    return (
      <Link href={href} className={combined} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={combined} {...props}>
      {children}
    </button>
  );
};

export default Button;
