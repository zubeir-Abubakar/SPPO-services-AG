import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.ppo.ch"),
  title: {
    default: "PPO Services AG — Fresh produce, global relationships",
    template: "%s — PPO Services AG",
  },
  description:
    "PPO Services AG — fresh fruit and vegetable trading, supported by more than 70 years of experience and international producer relationships.",
  applicationName: "PPO Services AG",
  openGraph: {
    type: "website",
    siteName: "PPO Services AG",
    locale: "en_CH",
  },
  icons: {
    icon: "/ppo/_assets/1a1c4462d009da437855101cc7ff64ea/Favicons/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f5f4e9",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = (await headers()).get("x-ppo-locale") ?? "de";
  return (
    <html lang={locale}>
      <body>{children}</body>
    </html>
  );
}
