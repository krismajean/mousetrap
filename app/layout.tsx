import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  style: ["normal", "italic"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://unavoidablyunsafe.com"),
  title: "unavoidably unsafe",
  description:
    "Bond over the mild discomfort of live traps and personal challenges in a quest to build a tower without too much injury.",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "unavoidably unsafe",
    url: "https://unavoidablyunsafe.com",
    siteName: "unavoidably unsafe",
    images: [
      {
        url: "/logo.png",
        width: 1500,
        height: 407,
        alt: "unavoidably unsafe logo",
      },
    ],
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-US">
      <body className={poppins.className}>
        <a href="#main-content" className="sr-only">
          Skip to Content
        </a>
        <Header />
        <main id="main-content">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
