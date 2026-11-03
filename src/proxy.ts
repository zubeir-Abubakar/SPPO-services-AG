import { NextRequest, NextResponse } from "next/server";

const supportedLocales = new Set(["de", "en", "fr", "it", "es"]);

export function proxy(request: NextRequest) {
  const requestedLocale = request.nextUrl.pathname.split("/")[1];
  const suppliedLocale = request.headers.get("x-ppo-locale");
  const headers = new Headers(request.headers);
  headers.set(
    "x-ppo-locale",
    supportedLocales.has(requestedLocale)
      ? requestedLocale
      : suppliedLocale && supportedLocales.has(suppliedLocale)
        ? suppliedLocale
        : "de",
  );
  return NextResponse.next({ request: { headers } });
}
