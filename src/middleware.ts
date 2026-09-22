import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Suspicious patterns in query parameters (LFI, XSS, SSTI, SSRF, wrappers)
const DANGEROUS_PARAM_REGEX = /(?:(?:javascript|vbscript|data|file|php|phar|dict|gopher|zip|bzip2|zlib):|<\s*(?:script|svg|img|iframe|object|embed)|(?:onerror|onload)\s*=|alert\s*\(|eval\s*\(|prompt\s*\(|confirm\s*\(|\{\{.*?\}\}|\$\{.*?\}|\[\[.*?\]\]|PD9waH|PD9QSFA|(?:\.\.[\/\\])|(?:https?:\/\/)|(?:127\.0\.0\.1)|(?:localhost)|(?:169\.254\.169\.254))/i;

export function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  // 1. Block XML Content-Type (prevents XXE / XML injection attempts)
  const contentType = req.headers.get("content-type")?.toLowerCase() || "";
  if (contentType.includes("xml")) {
    return new NextResponse(
      JSON.stringify({ error: "Unsupported Media Type: XML is not permitted." }),
      {
        status: 415,
        headers: {
          "content-type": "application/json",
        },
      }
    );
  }

  // 2. Reject non-standard HTTP methods on static page routes
  const method = req.method.toUpperCase();
  const isAllowedMethod = method === "GET" || method === "HEAD" || method === "OPTIONS";
  const isServerAction = req.headers.has("next-action");

  if (!isAllowedMethod && !isServerAction) {
    return new NextResponse(
      JSON.stringify({ error: `Method ${method} Not Allowed on this route.` }),
      {
        status: 405,
        headers: {
          "content-type": "application/json",
          allow: "GET, HEAD, OPTIONS",
        },
      }
    );
  }

  // 3. Inspect query parameters for malicious payloads (LFI, reflected XSS, SSTI, SSRF wrappers)
  for (const [key, value] of searchParams.entries()) {
    if (DANGEROUS_PARAM_REGEX.test(value) || DANGEROUS_PARAM_REGEX.test(key)) {
      return new NextResponse(
        JSON.stringify({ error: "Bad Request: Invalid query parameter detected." }),
        {
          status: 400,
          headers: {
            "content-type": "application/json",
          },
        }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, images, and static assets
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
