import { withAuth } from "next-auth/middleware";

export default withAuth({
    pages: {
        signIn: "/auth/signin",
    },
});

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - auth (authentication routes)
         * - api (API routes enforce authorization in their route handlers)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        "/((?!auth|api|_next/static|_next/image|favicon.ico).*)",
    ],
};
