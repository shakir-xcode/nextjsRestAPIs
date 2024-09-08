import { NextResponse } from "next/server";
import { authMiddleware } from "./middleware/api/authMiddleware";
import { logMiddleware } from "./middleware/api/logMiddleware";

export const config = {
    matcher: "/api/:path*",
}

export default function middleware(request) {
    const authResult = authMiddleware(request);
    if (request.url.includes("/api/blogs")) {
        const logResults = logMiddleware(request);
        console.log(logResults.response);
    }
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