import { NextRequest, NextResponse } from "next/server";

const supportedLocales = new Set(["de", "en", "fr", "it", "es"]);

export function proxy(request: NextRequest) {
  const requestedLocale = request.nextUrl.pathname.split("/")[1];
  const headers = new Headers(request.headers);
  headers.set(
    "x-ppo-locale",
    supportedLocales.has(requestedLocale) ? requestedLocale : "de",
  );
  return NextResponse.next({ request: { headers } });
}
