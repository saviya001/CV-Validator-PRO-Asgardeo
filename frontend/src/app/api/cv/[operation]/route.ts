import { NextRequest, NextResponse } from "next/server";
import { asgardeo } from "@asgardeo/nextjs/server";

// Browser calls only /api/cv/*; the user access token stays on this server.
// DO NOT use a user-supplied arbitrary URL as the upstream.
const allowedOperations = new Set([
  "analyze-multiple",
  "get-quiz",
  "generate-report",
]);

type Context = { params: Promise<{ operation: string }> };

export async function POST(request: NextRequest, context: Context) {
  const { operation } = await context.params;
  if (!allowedOperations.has(operation)) {
    return NextResponse.json({ detail: "Not found" }, { status: 404 });
  }

  let accessToken: string;
  try {
    const client = await asgardeo();
    const sessionId = await client.getSessionId();
    if (!sessionId) {
      return NextResponse.json({ detail: "Sign in required" }, { status: 401 });
    }
    const token = await client.getAccessToken(sessionId);
    if (!token) {
      return NextResponse.json({ detail: "Access token unavailable" }, { status: 401 });
    }
    accessToken = token;
  } catch {
    return NextResponse.json({ detail: "Sign in required" }, { status: 401 });
  }

  const upstream = (process.env.FASTAPI_INTERNAL_URL ?? "http://127.0.0.1:8000")
    .replace(/\/$/, "");

  try {
    // Use FormData so the browser never needs the Bearer token.
    const form = await request.formData();
    const response = await fetch(`${upstream}/${operation}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
      body: form,
      cache: "no-store",
      redirect: "manual",
    });

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      return NextResponse.json(
        { detail: response.ok ? "Unexpected API response" : "Backend request failed" },
        { status: response.ok ? 502 : response.status },
      );
    }
    const data: unknown = await response.json();
    return NextResponse.json(data, {
      status: response.status,
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    // Never log or return access tokens or the uploaded CV contents.
    return NextResponse.json(
      { detail: "CV API is unreachable. Check your FastAPI server." },
      { status: 502 },
    );
  }
}
