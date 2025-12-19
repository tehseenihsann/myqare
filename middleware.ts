import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAdminRoute = req.nextUrl.pathname.startsWith('/admin');

    // Redirect to sign in if trying to access admin without auth
    if (isAdminRoute && !token) {
      return NextResponse.redirect(new URL('/auth/signin', req.url));
    }

    // Allow access if authenticated
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const isAdminRoute = req.nextUrl.pathname.startsWith('/admin');
        return isAdminRoute ? !!token : true;
      },
    },
  }
);

export const config = {
  matcher: ['/admin/:path*'],
};

