import "./globals.css";
import { Inter } from "next/font/google";
import Providers from "./components/Providers";
import Header from "./components/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "MY REELS",
  description: "Demo of ImageKit integration with Next.js",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // A default theme like "dark" is now set permanently
    <html lang="en" data-theme="dark">
      <body className={inter.className}>
        <Providers>
          {/* Props have been removed from the Header component */}
          <Header />
          <main className="container mx-auto px-4 py-8">{children}</main>
        </Providers>
      </body>
    </html>
  );
}