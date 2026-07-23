import createMiddleware from 'next-intl/middleware';
 
export default createMiddleware({
  // A list of all locales that are supported
  locales: ['en', 'fr'],
 
  // Used when no locale matches
  defaultLocale: 'en'
});
 
export const config = {
  // Match all pathnames except for
  // - API routes
  // - Next.js internals
  // - static files
  // - files with an extension
  matcher: ['/((?!api|_next/static|_next/image|.*\\..*).*)']
};
