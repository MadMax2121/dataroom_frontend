// Temporarily disabled middleware to fix redirect issues
export { };

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Skip middleware for these paths completely
  if (
    path.startsWith('/_next') ||
    path.startsWith('/api') ||
    path === '/favicon.ico' ||
    path.includes('.') // Skip files with extensions
  ) {
    return NextResponse.next();
  }
  
  // Define public paths that don't require authentication
  const isPublicPath = path === '/login' || path === '/register';
  
  try {
    // Get the token
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });
    
    console.log(`Middleware: Path ${path}, Token exists: ${!!token}, Public path: ${isPublicPath}`);
    
    // Redirect logic
    if (isPublicPath && token) {
      // If user is logged in and trying to access login/register, redirect to home
      console.log('Middleware: Logged in user trying to access public path, redirecting to home');
      return NextResponse.redirect(new URL('/', request.url));
    }
    
    if (!isPublicPath && !token) {
      // If user is not logged in and trying to access protected route, redirect to login
      console.log('Middleware: User not logged in, redirecting to login');
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    // On error, proceed rather than creating an infinite redirect loop
    return NextResponse.next();
  }
}

// Configure paths that will trigger this middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes
     */
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
}; 