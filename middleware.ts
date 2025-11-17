import { updateSession } from "@/lib/supabase/middleware";
import { type NextRequest, NextResponse } from "next/server";

export default async function middleware(request: NextRequest) {
  // Update Supabase session and handle auth redirects
  const response = await updateSession(request);

  // If updateSession returned a redirect (e.g., user not authenticated),
  // return it immediately without modifications
  if (response.headers.get('location')) {
    return response;
  }

  // Add security headers to the response
  const securityHeaders = new Headers(response.headers);

  // Content Security Policy - Prevents XSS attacks
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live https://accounts.google.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://generativelanguage.googleapis.com https://api.openai.com https://api.anthropic.com https://accounts.google.com",
    "frame-src https://accounts.google.com", // Allow Google OAuth iframe
    "frame-ancestors 'none'", // Prevent clickjacking
  ].join('; ');
  securityHeaders.set('Content-Security-Policy', csp);

  // Prevent MIME type sniffing
  securityHeaders.set('X-Content-Type-Options', 'nosniff');

  // Prevent clickjacking
  securityHeaders.set('X-Frame-Options', 'DENY');

  // Enable XSS protection in older browsers
  securityHeaders.set('X-XSS-Protection', '1; mode=block');

  // Referrer Policy - Don't leak URLs to external sites
  securityHeaders.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions Policy - Disable unnecessary browser features
  securityHeaders.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  );

  // Strict-Transport-Security - Force HTTPS (only in production)
  if (process.env.NODE_ENV === 'production') {
    securityHeaders.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  // Create new response with security headers while preserving cookies
  const newResponse = NextResponse.next({
    request,
    headers: securityHeaders,
  });

  // IMPORTANT: Copy over all cookies from Supabase session update
  response.cookies.getAll().forEach((cookie) => {
    newResponse.cookies.set(cookie.name, cookie.value, cookie);
  });

  return newResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
