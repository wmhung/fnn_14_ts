// v1
// export default function middleware(req) {
//   console.log(req.url);
// }
// export const config = { matcher: '/((?!.*\\.).*)' };
// v2
// middleware.ts
// middleware.ts
// import { auth } from './app/_lib/auth';
// import { NextResponse } from 'next/server';

// export default auth((req) => {
//   const url = req.nextUrl.clone();
//   const { pathname } = url;

//   // Public routes that anyone can access
//   const publicPaths = ['/login', '/register', '/about', '/support', '/'];

//   // If path is public → allow
//   if (publicPaths.some((path) => pathname.startsWith(path))) {
//     return NextResponse.next();
//   }

//   // Protected routes
//   const protectedPaths = ['/parklist', '/dashboard'];

//   // If path is protected and user is NOT authenticated → redirect to login
//   if (
//     protectedPaths.some((path) => pathname.startsWith(path)) &&
//     !req.auth?.user
//   ) {
//     url.pathname = '/login';
//     return NextResponse.redirect(url);
//   }

//   // Example: Role-based page (future)
//   // if (pathname.startsWith('/admin') && req.auth?.user?.role !== 'admin') {
//   //   url.pathname = '/';
//   //   return NextResponse.redirect(url);
//   // }

//   // Default: allow
//   return NextResponse.next();
// });

// export const config = {
//   // Match all paths except Next.js internals
//   matcher: ['/((?!_next|static|favicon.ico).*)'],
// };
// v3
import { auth } from './app/_lib/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const url = req.nextUrl.clone();
  const { pathname } = url;

  const publicPaths = ['/login', '/register', '/about', '/support', '/'];
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const protectedPaths = ['/parklist', '/dashboard'];
  const isProtected = protectedPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  if (isProtected && !req.auth?.user) {
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next|static|favicon.ico).*)'],
};
