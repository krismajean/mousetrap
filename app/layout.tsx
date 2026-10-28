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
  metadataBase: new URL("https://www.mousetrapjenga.com"),
  title: "mousetrapjenga",
  description:
    "A patient adrenaline game for silly people — stack live mousetraps until the tower goes boom.",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "mousetrapjenga",
    url: "https://www.mousetrapjenga.com",
    siteName: "mousetrapjenga",
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
