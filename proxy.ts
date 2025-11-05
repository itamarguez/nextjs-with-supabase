import { updateSession } from "@/lib/supabase/middleware";
import { type NextRequest, NextResponse } from "next/server";

export default async function proxy(request: NextRequest) {
  // Update Supabase session
  const response = await updateSession(request);

  // Add security headers
  const headers = new Headers(response.headers);

  // Content Security Policy - Prevents XSS attacks
  // Note: Adjust 'unsafe-inline' and 'unsafe-eval' based on your needs
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live", // Vercel analytics
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://generativelanguage.googleapis.com https://api.openai.com https://api.anthropic.com",
    "frame-ancestors 'none'", // Prevent clickjacking
  ].join('; ');
  headers.set('Content-Security-Policy', csp);

  // Prevent MIME type sniffing
  headers.set('X-Content-Type-Options', 'nosniff');

  // Prevent clickjacking
  headers.set('X-Frame-Options', 'DENY');

  // Enable XSS protection in older browsers
  headers.set('X-XSS-Protection', '1; mode=block');

  // Referrer Policy - Don't leak URLs to external sites
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions Policy - Disable unnecessary browser features
  headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  );

  // Strict-Transport-Security - Force HTTPS (only in production)
  if (process.env.NODE_ENV === 'production') {
    headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  return NextResponse.next({
    request,
    headers,
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
