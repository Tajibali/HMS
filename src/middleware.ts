import { NextResponse } from 'next/server';
import { withAuth } from 'next-auth/middleware';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    
    const path = req.nextUrl.pathname;

    // Role Check For Admin-Only Routes
    const isAdminRoute = path.startsWith('/dashboard/doctors') || 
                        path.startsWith('/dashboard/patients');

    if (isAdminRoute && token?.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // Check if user is authenticated
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: '/login',
    }
  }
);

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/appointments/:path*',
    '/api/doctors/:path*',
    '/api/patients/:path*'
  ]
};
