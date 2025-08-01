import { withAuth } from 'next-auth/middleware';

export default withAuth(
  function middleware(req) {
    // Additional middleware logic can go here
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/sessions/:path*',
    '/leaderboard/:path*',
    '/api/sessions/:path*',
    '/api/participations/:path*',
    '/api/feedback/:path*'
  ],
};