import { NextResponse } from "next/server";
import { authMiddleware } from "./middleware/api/authMiddleware";

export const config = {
    matcher: "/api/:path*",
}

export default function middleware(request) {
    const authResult = authMiddleware(request);
    if (!authResult?.isValid) {
        // if (!authResult?.isValid && request.url.includes("/api/blogs")) {
        return new NextResponse(
            JSON.stringify({ message: "Unauthorized" }), {
            status: 401,
        }
        );
    }
    return NextResponse.next();
}