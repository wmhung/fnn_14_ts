'use client';
import { useEffect, useState } from 'react';

interface Props {
  children: React.ReactNode;
  className?: string;
}

export default function HydratedWrapper({ children, className }: Props) {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated) return null;

  return <div className={className}>{children}</div>;
}
